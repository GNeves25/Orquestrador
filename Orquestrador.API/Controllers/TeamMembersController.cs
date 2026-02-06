using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orquestrador.API.DTOs;
using Orquestrador.Domain.Models;
using Orquestrador.Infrastructure.Data;

namespace Orquestrador.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamMembersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TeamMembersController> _logger;

    public TeamMembersController(AppDbContext context, ILogger<TeamMembersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamMember>>> GetAll([FromQuery] bool? isActive = null)
    {
        var query = _context.TeamMembers.AsQueryable();

        if (isActive.HasValue)
            query = query.Where(t => t.IsActive == isActive.Value);

        var members = await query
            .OrderBy(t => t.Role)
            .ThenBy(t => t.Name)
            .ToListAsync();

        return Ok(members);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TeamMember>> GetById(Guid id)
    {
        var member = await _context.TeamMembers
            .Include(t => t.AssignedTasks)
            .Include(t => t.Responses)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (member == null)
            return NotFound();

        return Ok(member);
    }

    [HttpPost]
    public async Task<ActionResult<TeamMember>> Create([FromBody] CreateTeamMemberDto dto)
    {
        _logger.LogInformation("Received CreateTeamMember request: Name={Name}, Role={Role}, Description={Description}", 
            dto.Name, dto.Role, dto.Description);

        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state: {Errors}", 
                string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
            return BadRequest(ModelState);
        }

        var member = new TeamMember
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Role = dto.Role,
            Description = dto.Description,
            AgentEndpoint = dto.AgentEndpoint,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.TeamMembers.Add(member);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created team member {Name} with role {Role}", member.Name, member.Role);

        return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateTeamMemberDto dto)
    {
        var member = await _context.TeamMembers.FindAsync(id);
        if (member == null)
            return NotFound();

        if (!string.IsNullOrEmpty(dto.Name))
            member.Name = dto.Name;

        if (!string.IsNullOrEmpty(dto.Description))
            member.Description = dto.Description;

        if (dto.IsActive.HasValue)
            member.IsActive = dto.IsActive.Value;

        if (dto.AgentEndpoint != null)
            member.AgentEndpoint = dto.AgentEndpoint;

        member.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var member = await _context.TeamMembers.FindAsync(id);
        if (member == null)
            return NotFound();

        _context.TeamMembers.Remove(member);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted team member {Name}", member.Name);

        return NoContent();
    }

    [HttpGet("by-role/{role}")]
    public async Task<ActionResult<IEnumerable<TeamMember>>> GetByRole(string role)
    {
        if (!Enum.TryParse<Domain.Enums.TeamMemberRole>(role, true, out var roleEnum))
            return BadRequest("Invalid role");

        var members = await _context.TeamMembers
            .Where(t => t.Role == roleEnum && t.IsActive)
            .ToListAsync();

        return Ok(members);
    }
}
