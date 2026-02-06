using Orquestrador.Domain.Enums;

namespace Orquestrador.Domain.Models;

public class WorkflowStep
{
    public Guid ProjectId { get; set; }
    public TeamMemberRole AgentRole { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public string StepName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsThinking { get; set; }
    public bool IsCompleted { get; set; }
}
