using Microsoft.EntityFrameworkCore;
using SMR.Api.Domain;

namespace SMR.Api.Infrastructure.Data;

public static class DbInitializer
{
    private static readonly Guid BranchId   = new("00000001-0000-0000-0000-000000000000");
    private static readonly Guid DaveId     = new("00000002-0000-0000-0000-000000000000");
    private static readonly Guid SarahId    = new("00000003-0000-0000-0000-000000000000");
    private static readonly Guid TomId      = new("00000004-0000-0000-0000-000000000000");

    public static async Task SeedAsync(WebApplication app)
    {
        using IServiceScope scope = app.Services.CreateScope();
        AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (db.Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
            await db.Database.MigrateAsync();

        if (await db.Branches.AnyAsync())
            return;

        db.Branches.Add(new Branch { Id = BranchId, Name = "Leeds Branch" });

        db.Mechanics.AddRange(
            new Mechanic { Id = DaveId,  Name = "Dave",  BranchId = BranchId },
            new Mechanic { Id = SarahId, Name = "Sarah", BranchId = BranchId },
            new Mechanic { Id = TomId,   Name = "Tom",   BranchId = BranchId }
        );

        Guid[] mechanicIds = [DaveId, SarahId, TomId];
        TimeSpan[] starts  = [TimeSpan.FromHours(9), TimeSpan.FromHours(13)];

        DateTime today = DateTime.UtcNow.Date;

        for (int day = 0; day < 7; day++)
        {
            DateTime date = today.AddDays(day);
            foreach (Guid mechanicId in mechanicIds)
            {
                foreach (TimeSpan start in starts)
                {
                    db.Slots.Add(new Slot
                    {
                        Id         = Guid.NewGuid(),
                        BranchId   = BranchId,
                        MechanicId = mechanicId,
                        StartTime  = date + start,
                        EndTime    = date + start + TimeSpan.FromHours(2),
                        IsBooked   = false,
                    });
                }
            }
        }

        await db.SaveChangesAsync();
    }
}
