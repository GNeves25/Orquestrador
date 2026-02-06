using Orquestrador.Domain.Enums;

namespace Orquestrador.Domain.Models;

public class ProjectTask
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid? AssignedToId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.Pending;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Context { get; set; }
    public string? ExpectedOutput { get; set; }
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public TeamMember? AssignedTo { get; set; }
    public ICollection<AgentResponse> Responses { get; set; } = new List<AgentResponse>();
}
