using Orquestrador.Domain.Enums;

namespace Orquestrador.Domain.Models;

public class Project
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Requirements { get; set; }
    public string? TechnicalStack { get; set; }
    
    // Navigation properties
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}
