using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orquestrador.API.DTOs;
using Orquestrador.Domain.Models;
using Orquestrador.Infrastructure.Data;
using Orquestrador.Infrastructure.Services;

namespace Orquestrador.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AgentOrchestrationService _orchestrationService;
    private readonly ILogger<TasksController> _logger;

    public TasksController(
        AppDbContext context,
        AgentOrchestrationService orchestrationService,
        ILogger<TasksController> logger)
    {
        _context = context;
        _orchestrationService = orchestrationService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectTask>>> GetAll()
    {
        var tasks = await _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.AssignedTo)
            .OrderByDescending(t => t.Priority)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectTask>> GetById(Guid id)
    {
        var task = await _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.AssignedTo)
            .Include(t => t.Responses)
                .ThenInclude(r => r.TeamMember)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound();

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectTask>> Create(CreateTaskDto dto)
    {
        var project = await _context.Projects.FindAsync(dto.ProjectId);
        if (project == null)
            return BadRequest("Project not found");

        if (dto.AssignedToId.HasValue)
        {
            var teamMember = await _context.TeamMembers.FindAsync(dto.AssignedToId.Value);
            if (teamMember == null)
                return BadRequest("Team member not found");
        }

        var task = new ProjectTask
        {
            Id = Guid.NewGuid(),
            ProjectId = dto.ProjectId,
            AssignedToId = dto.AssignedToId,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Context = dto.Context,
            ExpectedOutput = dto.ExpectedOutput,
            Status = Domain.Enums.TaskStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created task {Title} for project {ProjectId}", task.Title, task.ProjectId);

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        if (!string.IsNullOrEmpty(dto.Title))
            task.Title = dto.Title;

        if (!string.IsNullOrEmpty(dto.Description))
            task.Description = dto.Description;

        if (dto.Status.HasValue)
            task.Status = dto.Status.Value;

        if (dto.Priority.HasValue)
            task.Priority = dto.Priority.Value;

        if (dto.AssignedToId.HasValue)
        {
            var teamMember = await _context.TeamMembers.FindAsync(dto.AssignedToId.Value);
            if (teamMember == null)
                return BadRequest("Team member not found");
            
            task.AssignedToId = dto.AssignedToId.Value;
        }

        if (dto.Context != null)
            task.Context = dto.Context;

        if (dto.ExpectedOutput != null)
            task.ExpectedOutput = dto.ExpectedOutput;

        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted task {Title}", task.Title);

        return NoContent();
    }

    [HttpPost("{id}/execute")]
    public async Task<ActionResult<AgentResponse>> ExecuteTask(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        if (task.AssignedToId == null)
            return BadRequest("Task must be assigned to a team member before execution");

        _logger.LogInformation("Executing task {TaskId}", id);

        try
        {
            var response = await _orchestrationService.ExecuteTaskAsync(id);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing task {TaskId}", id);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id}/responses")]
    public async Task<ActionResult<IEnumerable<AgentResponse>>> GetTaskResponses(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        var responses = await _context.AgentResponses
            .Where(r => r.TaskId == id)
            .Include(r => r.TeamMember)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(responses);
    }
}
