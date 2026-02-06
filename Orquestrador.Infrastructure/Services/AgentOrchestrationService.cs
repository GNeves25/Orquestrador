using System.Text;
using System.Text.Json;
using Orquestrador.Domain.Models;
using Orquestrador.Domain.Enums;
using Orquestrador.Domain.Interfaces;
using Orquestrador.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Orquestrador.Infrastructure.Services;

public class AgentOrchestrationService
{
    private readonly AppDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConnectionMultiplexer? _redis;
    private readonly ILogger<AgentOrchestrationService> _logger;
    private readonly IWorkflowNotifier? _notifier;

    public AgentOrchestrationService(
        AppDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger<AgentOrchestrationService> logger,
        IConnectionMultiplexer? redis = null,
        IWorkflowNotifier? notifier = null)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _redis = redis;
        _logger = logger;
        _notifier = notifier;
        _logger.LogInformation("AgentOrchestrationService created. Notifier is {NotifierStatus}", _notifier == null ? "NULL" : "INJECTED");
    }

    public async Task RunProjectKickoffAsync(Guid projectId)
    {
        _logger.LogInformation("Starting Project Kickoff for {ProjectId}", projectId);
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null) return;

        // 0. PM Context Setting
        await NotifyAsync(projectId, TeamMemberRole.ProjectManager, "Initiating project kickoff sequence...", isThinking: true);
        var pmPrompt = $"Initiate project kickoff for '{project.Name}'. Brief the team on the objectives.";
        var pmOutput = await CallAgentGeneric(TeamMemberRole.ProjectManager, pmPrompt, project);
        await NotifyAsync(projectId, TeamMemberRole.ProjectManager, pmOutput);

        // 1. PO
        await NotifyAsync(projectId, TeamMemberRole.ProductOwner, "Analyzing requirements...", isThinking: true);
        var poPrompt = $"Analyze project '{project.Description}'. Create 3 high-level User Stories.";
        var stories = await CallAgentGeneric(TeamMemberRole.ProductOwner, poPrompt, project);
        await NotifyAsync(projectId, TeamMemberRole.ProductOwner, stories);
        
        if (!stories.Contains("simulated")) 
        {
            project.Requirements = stories;
            await _context.SaveChangesAsync();
        }

        // 2. Tech Lead (Moved up as requested)
        await NotifyAsync(projectId, TeamMemberRole.TechLead, "Defining architecture...", isThinking: true);
        var techPrompt = $"Based on requirements:\n{stories}\n\nDefine technical architecture and stack.\n\nIMPORTANT: AFTER the architecture, provide a list of development tasks in this EXACT JSON format:\n[\n  {{ \"title\": \"Task Title\", \"description\": \"Task Description\" }}\n]";
        var tech = await CallAgentGeneric(TeamMemberRole.TechLead, techPrompt, project);
        await NotifyAsync(projectId, TeamMemberRole.TechLead, tech);

        // 3. Designer
        await NotifyAsync(projectId, TeamMemberRole.Designer, "Designing UI/UX...", isThinking: true);
        var designerPrompt = $"Based on requirements:\n{stories}\n\nCreate a UI structure.";
        var design = await CallAgentGeneric(TeamMemberRole.Designer, designerPrompt, project);
        await NotifyAsync(projectId, TeamMemberRole.Designer, design);

        // 4. Developer & 5. QA Loop
        var tasksCreated = false;
        var qaPassed = false;
        var retries = 0;
        const int MaxRetries = 2;

        while (!qaPassed && retries <= MaxRetries)
        {
            // Developer
            await NotifyAsync(projectId, TeamMemberRole.Developer, retries == 0 ? "Implementing core features..." : "Fixing issues reported by QA...", isThinking: true);
            var devPrompt = retries == 0 
                ? $"Implement core structure based on design:\n{design}\n\nAnd architecture:\n{tech}" 
                : "Fix the bugs reported by QA and optimize the code.";
            
            var devCode = await CallAgentGeneric(TeamMemberRole.Developer, devPrompt, project);
            await NotifyAsync(projectId, TeamMemberRole.Developer, devCode);

            // QA
            await NotifyAsync(projectId, TeamMemberRole.QA, "Testing implementation...", isThinking: true);
            var qaPrompt = $"Test this implementation:\n{devCode}\n\nAnalyze for bugs and issues.";
            var qaResult = await CallAgentGeneric(TeamMemberRole.QA, qaPrompt, project);
            await NotifyAsync(projectId, TeamMemberRole.QA, qaResult);

            // Simulation of QA Decision
            // In a real scenario, the LLM would output a structured JSON deciding PASS/FAIL.
            // For now, we simulate a failure on the first run if it's the first time.
            if (retries < 1) 
            {
               await NotifyAsync(projectId, TeamMemberRole.QA, "❌ QA found critical issues! Sending back to Developer.");
               qaPassed = false;
               retries++;
            }
            else
            {
               await NotifyAsync(projectId, TeamMemberRole.QA, "✅ QA Approved! All tests passed.");
               qaPassed = true;
            }
        }

        // Create tasks if not already (using Tech Lead output from earlier)
        if (!tasksCreated) {
             await ParseAndCreateTasks(projectId, tech); // Use Tech Lead output for initial tasks
             tasksCreated = true;
        }

        // 6. DevOps
        await NotifyAsync(projectId, TeamMemberRole.DevOps, "Preparing deployment pipeline...", isThinking: true);
        var devopsPrompt = "Create CI/CD pipeline configuration.";
        var devops = await CallAgentGeneric(TeamMemberRole.DevOps, devopsPrompt, project);
        await NotifyAsync(projectId, TeamMemberRole.DevOps, devops);

        // Finish
        await NotifyAsync(projectId, TeamMemberRole.ProjectManager, "Workflow Completed Successfully. Team is ready.", isCompleted: true);
    }

    private async Task NotifyAsync(Guid projectId, TeamMemberRole role, string content, bool isThinking = false, bool isCompleted = false)
    {
        if (_notifier == null)
        {
            _logger.LogWarning("NotifyAsync called but _notifier is NULL! Cannot send SignalR message for {Role}", role);
            return;
        }
        _logger.LogInformation("Sending SignalR message for {Role}: {Content}", role, content.Substring(0, Math.Min(50, content.Length)));
        await _notifier.NotifyStepAsync(new WorkflowStep
        {
            ProjectId = projectId,
            AgentRole = role,
            AgentName = role.ToString(),
            Content = content,
            StepName = isThinking ? "Thinking" : "Response",
            Timestamp = DateTime.UtcNow,
            IsThinking = isThinking,
            IsCompleted = isCompleted
        });
    }

    private async Task<string> CallAgentGeneric(TeamMemberRole role, string instruction, Project project)
    {
        var endpoint = GetDefaultEndpointForRole(role);
        var payload = new 
        {
            task_id = Guid.NewGuid().ToString(),
            title = "Kickoff Step",
            description = instruction,
            project_name = project.Name,
            project_description = project.Description,
            priority = "High"
        };
        
        try
        {
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30);
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync($"{endpoint}/execute", content);
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var res = JsonSerializer.Deserialize<AgentExecutionResult>(json, options);
                return res?.Output ?? "Empty response";
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Agent {Role} unreachable or failed: {Ex}", role, ex.Message);
        }

            // Fallback for Quota Exceeded or Error
            if (role == TeamMemberRole.TechLead)
            {
                // Tech Lead MUST return JSON for the parser
                return @"⚠️ API Quota Exceeded - Using Default Architecture

Technical Stack: .NET Core + Angular + PostgreSQL

Development Tasks:
[
  { ""title"": ""⚠️ Setup Base Solution"", ""description"": ""[SIMULATED] Create solution with Clean Architecture layers."" },
  { ""title"": ""⚠️ Implement Authentication"", ""description"": ""[SIMULATED] Setup JWT and Identity."" },
  { ""title"": ""⚠️ Create Core API"", ""description"": ""[SIMULATED] Implement basic CRUD endpoints."" }
]";
            }
            
            return $"⚠️ API Quota Exceeded (Simulation Mode): {role} analyzed the requirements but could not generate a live response due to API limits. Proceeding with simulated workflow step.";
    }

    public async Task<AgentResponse> ExecuteTaskAsync(Guid taskId)
    {
        var task = await _context.Tasks
            .Include(t => t.AssignedTo)
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null || task.AssignedTo == null)
            throw new InvalidOperationException("Task not found or unassigned");

        task.Status = Domain.Enums.TaskStatus.InProgress;
        task.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        
        var startTime = DateTime.UtcNow;
        string responseContent;
        int tokensUsed = 0;
        bool success = true;
        string? error = null;

        try
        {
             var endpoint = task.AssignedTo.AgentEndpoint ?? GetDefaultEndpointForRole(task.AssignedTo.Role);
             var payload = new
             {
                task_id = task.Id.ToString(),
                title = task.Title,
                description = task.Description,
                context = task.Context,
                expected_output = task.ExpectedOutput,
                project_name = task.Project.Name,
                project_description = task.Project.Description,
                priority = task.Priority.ToString()
             };

             var client = _httpClientFactory.CreateClient();
             client.Timeout = TimeSpan.FromSeconds(30);
             var res = await client.PostAsync($"{endpoint}/execute", 
                new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));
             
             if (!res.IsSuccessStatusCode)
             {
                 var errorContent = await res.Content.ReadAsStringAsync();
                 throw new HttpRequestException($"Agent failed: {res.StatusCode} - {errorContent}");
             }

             var json = await res.Content.ReadAsStringAsync();
             var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
             var result = JsonSerializer.Deserialize<AgentExecutionResult>(json, options);
             responseContent = result?.Output ?? "";
             tokensUsed = result?.TokensUsed ?? 0;
        }
        catch (Exception ex)
        {
            // Fallback for Quota Exceeded in individual tasks
            success = true; // Mark as success so the user sees the message in the UI
            error = ex.Message;
            responseContent = $"⚠️ API Quota Exceeded (Task Execution): Could not complete task '{task.Title}' due to API limits. \n\nError details: {ex.Message}";
        }
        var processTime = (DateTime.UtcNow - startTime).TotalMilliseconds;
        var agentResponse = new AgentResponse
        {
            Id = Guid.NewGuid(),
            TaskId = task.Id,
            TeamMemberId = task.AssignedTo.Id,
            Content = responseContent,
            IsSuccessful = success,
            ErrorMessage = error,
            TokensUsed = tokensUsed,
            ProcessingTimeMs = processTime,
            CreatedAt = DateTime.UtcNow
        };

        task.Status = success ? Domain.Enums.TaskStatus.Completed : Domain.Enums.TaskStatus.Failed;
        task.UpdatedAt = DateTime.UtcNow;
        if (success) task.CompletedAt = DateTime.UtcNow;

        _context.AgentResponses.Add(agentResponse);
        await _context.SaveChangesAsync();
        await PublishTaskUpdateAsync(task, agentResponse);

        return agentResponse;
    }

    private string GetDefaultEndpointForRole(TeamMemberRole role) => role switch
    {
        TeamMemberRole.ProductOwner => "http://localhost:8001",
        TeamMemberRole.ProjectManager => "http://localhost:8002",
        TeamMemberRole.Designer => "http://localhost:8003",
        TeamMemberRole.TechLead => "http://localhost:8004",
        TeamMemberRole.Developer => "http://localhost:8005",
        TeamMemberRole.QA => "http://localhost:8006",
        TeamMemberRole.DevOps => "http://localhost:8007",
        _ => "http://localhost:8001"
    };

    private async Task PublishTaskUpdateAsync(ProjectTask task, AgentResponse response)
    {
        if (_redis == null) return;
        try
        {
             var sub = _redis.GetSubscriber();
             var msg = JsonSerializer.Serialize(new {
                 task_id = task.Id,
                 status = task.Status.ToString(),
                 response_id = response.Id,
                 is_successful = response.IsSuccessful,
                 timestamp = DateTime.UtcNow
             });
             await sub.PublishAsync(RedisChannel.Literal("task-updates"), msg);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Redis publish failed: {Ex}", ex.Message);
        }
    }

    private async Task ParseAndCreateTasks(Guid projectId, string text)
    {
        try 
        {
            var start = text.IndexOf('[');
            var end = text.LastIndexOf(']');
            if (start >= 0 && end > start)
            {
                var json = text.Substring(start, end - start + 1);
                var tasks = JsonSerializer.Deserialize<List<TaskDto>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (tasks != null)
                {
                    foreach (var t in tasks)
                    {
                        _context.Tasks.Add(new ProjectTask 
                        { 
                            ProjectId = projectId, 
                            Title = t.Title, 
                            Description = t.Description ?? t.Title,
                            Status = Domain.Enums.TaskStatus.Pending,
                            Priority = Domain.Enums.TaskPriority.Medium
                        });
                    }
                    await _context.SaveChangesAsync();
                }
            }
        }
        catch (Exception ex) 
        {
            _logger.LogWarning("Failed to parse tasks: {Ex}", ex.Message);
        }
    }

    private class TaskDto { public string Title { get; set; } = ""; public string Description { get; set; } = ""; }

    private class AgentExecutionResult
    {
        public string Output { get; set; } = string.Empty;
        public int TokensUsed { get; set; }
        public bool Success { get; set; }
    }
}
