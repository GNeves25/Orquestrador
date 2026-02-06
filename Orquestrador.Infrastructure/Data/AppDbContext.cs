using Microsoft.EntityFrameworkCore;
using Orquestrador.Domain.Models;

namespace Orquestrador.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> Tasks => Set<ProjectTask>();
    public DbSet<AgentResponse> AgentResponses => Set<AgentResponse>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // TeamMember configuration
        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.AgentEndpoint).HasMaxLength(500);
            entity.HasIndex(e => e.Role);
            entity.HasIndex(e => e.IsActive);
        });

        // Project configuration
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
        });

        // ProjectTask configuration
        modelBuilder.Entity<ProjectTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Priority);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.AssignedToId);

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.AssignedTo)
                .WithMany(t => t.AssignedTasks)
                .HasForeignKey(e => e.AssignedToId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // AgentResponse configuration
        modelBuilder.Entity<AgentResponse>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TaskId);
            entity.HasIndex(e => e.TeamMemberId);
            entity.HasIndex(e => e.CreatedAt);

            entity.HasOne(e => e.Task)
                .WithMany(t => t.Responses)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.TeamMember)
                .WithMany(t => t.Responses)
                .HasForeignKey(e => e.TeamMemberId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
