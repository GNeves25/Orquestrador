using Microsoft.AspNetCore.Mvc;
using Orquestrador.Infrastructure.Services;

namespace Orquestrador.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkflowController : ControllerBase
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<WorkflowController> _logger;

    public WorkflowController(IServiceScopeFactory scopeFactory, ILogger<WorkflowController> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    [HttpPost("{projectId}/kickoff")]
    public IActionResult StartKickoff(Guid projectId)
    {
        _logger.LogInformation("Kickoff requested for project {ProjectId}", projectId);
        
        _ = Task.Run(async () =>
        {
            try 
            {
                _logger.LogInformation("Starting background kickoff for project {ProjectId}", projectId);
                using var scope = _scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<AgentOrchestrationService>();
                await service.RunProjectKickoffAsync(projectId);
                _logger.LogInformation("Kickoff completed for project {ProjectId}", projectId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in background kickoff for project {ProjectId}", projectId);
            }
        });

        return Accepted(new { message = "Workflow process started" });
    }
}
