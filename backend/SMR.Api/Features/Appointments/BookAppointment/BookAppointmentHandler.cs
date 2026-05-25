using MediatR;
using Microsoft.EntityFrameworkCore;
using SMR.Api.Domain;
using SMR.Api.Infrastructure.Data;
using SMR.Api.Infrastructure.Exceptions;

namespace SMR.Api.Features.Appointments.BookAppointment;

public sealed class BookAppointmentHandler : IRequestHandler<BookAppointmentCommand, AppointmentDto>
{
    private readonly AppDbContext _db;

    public BookAppointmentHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AppointmentDto> Handle(BookAppointmentCommand request, CancellationToken cancellationToken)
    {
        Slot? slot = await _db.Slots
            .Include(s => s.Mechanic)
            .FirstOrDefaultAsync(s => s.Id == request.SlotId, cancellationToken);

        if (slot is null)
        {
            throw new NotFoundException($"Slot {request.SlotId} not found.");
        }

        if (slot.IsBooked)
        {
            throw new ConflictException($"Slot {request.SlotId} is already booked.");
        }

        slot.IsBooked = true;

        Guid appointmentId = Guid.NewGuid();

        Appointment appointment = new()
        {
            Id = appointmentId,
            SlotId = slot.Id,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            VehicleReg = request.VehicleReg,
            ServiceType = request.ServiceType!.Value,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _db.Appointments.Add(appointment);

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException($"Slot {request.SlotId} was booked concurrently. Please choose another slot.");
        }

        string reference = $"SMR-{appointmentId.ToString("N")[..8].ToUpperInvariant()}";

        return new AppointmentDto(
            appointmentId,
            slot.Id,
            slot.Mechanic.Name,
            slot.StartTime,
            slot.EndTime,
            appointment.CustomerName,
            appointment.VehicleReg,
            appointment.ServiceType,
            appointment.Notes,
            reference);
    }
}
