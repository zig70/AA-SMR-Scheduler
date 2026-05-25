using SMR.Api.Domain;

namespace SMR.Api.Features.Appointments.BookAppointment;

public sealed record AppointmentDto(
    Guid AppointmentId,
    Guid SlotId,
    string MechanicName,
    DateTime StartTime,
    DateTime EndTime,
    string CustomerName,
    string VehicleReg,
    ServiceType ServiceType,
    string? Notes,
    string Reference);
