using MediatR;
using Microsoft.EntityFrameworkCore;
using SMR.Api.Infrastructure.Data;

namespace SMR.Api.Features.Slots.GetAvailableSlots;

public sealed class GetAvailableSlotsHandler : IRequestHandler<GetAvailableSlotsQuery, List<SlotDto>>
{
    private readonly AppDbContext _db;

    public GetAvailableSlotsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<SlotDto>> Handle(GetAvailableSlotsQuery request, CancellationToken cancellationToken)
    {
        List<SlotDto> slots = await _db.Slots
            .AsNoTracking()
            .Include(s => s.Mechanic)
            .Where(s => s.BranchId == request.BranchId && !s.IsBooked)
            .Select(s => new SlotDto(s.Id, s.Mechanic.Name, s.StartTime, s.EndTime))
            .ToListAsync(cancellationToken);

        return slots;
    }
}
