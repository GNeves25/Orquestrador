using Orquestrador.Domain.Enums;

namespace Orquestrador.API.DTOs;

public class CreateTeamMemberDto
{
    public string Name { get; set; } = string.Empty;
    public TeamMemberRole Role { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? AgentEndpoint { get; set; }
}

public class UpdateTeamMemberDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
    public string? AgentEndpoint { get; set; }
}

public class CreateProjectDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public string? TechnicalStack { get; set; }
}

public class UpdateProjectDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public ProjectStatus? Status { get; set; }
    public string? Requirements { get; set; }
    public string? TechnicalStack { get; set; }
}

public class CreateTaskDto
{
    public Guid ProjectId { get; set; }
    public Guid? AssignedToId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public string? Context { get; set; }
    public string? ExpectedOutput { get; set; }
}

public class UpdateTaskDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public Domain.Enums.TaskStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public Guid? AssignedToId { get; set; }
    public string? Context { get; set; }
    public string? ExpectedOutput { get; set; }
}
