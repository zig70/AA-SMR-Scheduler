using Microsoft.EntityFrameworkCore;
using SMR.Api.Domain;

namespace SMR.Api.Infrastructure.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Mechanic> Mechanics => Set<Mechanic>();
    public DbSet<Slot> Slots => Set<Slot>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Slot has two cascade paths to Branch (direct + via Mechanic).
        // SQL Server forbids multiple cascade paths — restrict the direct one.
        modelBuilder.Entity<Slot>()
            .HasOne(s => s.Branch)
            .WithMany()
            .HasForeignKey(s => s.BranchId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
