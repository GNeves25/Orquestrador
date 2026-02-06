using Microsoft.AspNetCore.SignalR;
using Orquestrador.API.Hubs;
using Orquestrador.Domain.Interfaces;
using Orquestrador.Domain.Models;

namespace Orquestrador.API.Services;

public class SignalRWorkflowNotifier : IWorkflowNotifier
{
    private readonly IHubContext<OrchestrationHub> _hubContext;
    private readonly ILogger<SignalRWorkflowNotifier> _logger;

    public SignalRWorkflowNotifier(IHubContext<OrchestrationHub> hubContext, ILogger<SignalRWorkflowNotifier> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyStepAsync(WorkflowStep step)
    {
        try
        {
            var groupName = $"project-{step.ProjectId.ToString().ToLowerInvariant()}";
            _logger.LogInformation("Broadcasting step to ALL (Target Group was: {GroupName})", groupName);
            await _hubContext.Clients.All.SendAsync("ReceiveWorkflowStep", step);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending workflow step via SignalR");
        }
    }
}
