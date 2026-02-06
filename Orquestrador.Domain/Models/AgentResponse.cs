namespace Orquestrador.Domain.Models;

public class AgentResponse
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid TeamMemberId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsSuccessful { get; set; } = true;
    public string? ErrorMessage { get; set; }
    public int TokensUsed { get; set; }
    public double ProcessingTimeMs { get; set; }
    
    // Navigation properties
    public ProjectTask Task { get; set; } = null!;
    public TeamMember TeamMember { get; set; } = null!;
}
