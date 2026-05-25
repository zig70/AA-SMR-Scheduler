using MediatR;
using Microsoft.EntityFrameworkCore;
using SMR.Api.Infrastructure.Data;

namespace SMR.Api.Features.Appointments.GetMechanicAppointments;

public sealed class GetMechanicAppointmentsHandler
    : IRequestHandler<GetMechanicAppointmentsQuery, List<MechanicAppointmentDto>>
{
    private readonly AppDbContext _db;

    public GetMechanicAppointmentsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<MechanicAppointmentDto>> Handle(
        GetMechanicAppointmentsQuery request,
        CancellationToken cancellationToken)
    {
        List<MechanicAppointmentDto> appointments = await _db.Appointments
            .AsNoTracking()
            .Include(a => a.Slot)
                .ThenInclude(s => s.Mechanic)
            .Where(a => a.Slot.MechanicId == request.MechanicId)
            .OrderBy(a => a.Slot.StartTime)
            .Select(a => new MechanicAppointmentDto(
                a.Id,
                a.Slot.Mechanic.Name,
                a.Slot.StartTime,
                a.Slot.EndTime,
                a.CustomerName,
                a.VehicleReg))
            .ToListAsync(cancellationToken);

        return appointments;
    }
}
