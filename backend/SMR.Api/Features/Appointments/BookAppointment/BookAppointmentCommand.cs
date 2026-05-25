using MediatR;

namespace SMR.Api.Features.Appointments.BookAppointment;

public sealed record BookAppointmentCommand(
    Guid SlotId,
    string CustomerName,
    string CustomerPhone,
    string VehicleReg) : IRequest<AppointmentDto>;
