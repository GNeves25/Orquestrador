using Microsoft.AspNetCore.SignalR;

namespace Orquestrador.API.Hubs;

public class OrchestrationHub : Hub
{
    private readonly ILogger<OrchestrationHub> _logger;

    public OrchestrationHub(ILogger<OrchestrationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinProject(string projectId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"project-{projectId.ToLowerInvariant()}");
        _logger.LogInformation("Client {ConnectionId} joined project {ProjectId}", Context.ConnectionId, projectId.ToLowerInvariant());
    }

    public async Task LeaveProject(string projectId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"project-{projectId.ToLowerInvariant()}");
        _logger.LogInformation("Client {ConnectionId} left project {ProjectId}", Context.ConnectionId, projectId.ToLowerInvariant());
    }
}
