using Orquestrador.Domain.Enums;

namespace Orquestrador.Domain.Models;

public class TeamMember
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TeamMemberRole Role { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? AgentEndpoint { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<ProjectTask> AssignedTasks { get; set; } = new List<ProjectTask>();
    public ICollection<AgentResponse> Responses { get; set; } = new List<AgentResponse>();
}
