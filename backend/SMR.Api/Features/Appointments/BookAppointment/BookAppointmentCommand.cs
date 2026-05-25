using MediatR;
using SMR.Api.Domain;

namespace SMR.Api.Features.Appointments.BookAppointment;

public sealed record BookAppointmentCommand(
    Guid SlotId,
    string CustomerName,
    string CustomerPhone,
    string VehicleReg,
    ServiceType? ServiceType,
    string? Notes) : IRequest<AppointmentDto>;
