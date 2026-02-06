using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orquestrador.API.DTOs;
using Orquestrador.Domain.Models;
using Orquestrador.Infrastructure.Data;

namespace Orquestrador.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(AppDbContext context, ILogger<ProjectsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetAll()
    {
        var projects = await _context.Projects
            .Include(p => p.Tasks)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> GetById(Guid id)
    {
        var project = await _context.Projects
            .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
            .Include(p => p.Tasks)
                .ThenInclude(t => t.Responses)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
            return NotFound();

        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<Project>> Create(CreateProjectDto dto)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            Requirements = dto.Requirements,
            TechnicalStack = dto.TechnicalStack,
            Status = Domain.Enums.ProjectStatus.Planning,
            CreatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created project {Name}", project.Name);

        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateProjectDto dto)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
            return NotFound();

        if (!string.IsNullOrEmpty(dto.Name))
            project.Name = dto.Name;

        if (!string.IsNullOrEmpty(dto.Description))
            project.Description = dto.Description;

        if (dto.Status.HasValue)
            project.Status = dto.Status.Value;

        if (dto.Requirements != null)
            project.Requirements = dto.Requirements;

        if (dto.TechnicalStack != null)
            project.TechnicalStack = dto.TechnicalStack;

        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
            return NotFound();

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted project {Name}", project.Name);

        return NoContent();
    }

    [HttpGet("{id}/tasks")]
    public async Task<ActionResult<IEnumerable<ProjectTask>>> GetProjectTasks(Guid id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
            return NotFound();

        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == id)
            .Include(t => t.AssignedTo)
            .Include(t => t.Responses)
            .OrderByDescending(t => t.Priority)
            .ThenBy(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }
}
