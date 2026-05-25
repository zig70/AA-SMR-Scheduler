using SMR.Api.Domain;

namespace SMR.Api.Features.Appointments.GetMechanicAppointments;

public sealed record MechanicAppointmentDto(
    Guid AppointmentId,
    string MechanicName,
    DateTime StartTime,
    DateTime EndTime,
    string CustomerName,
    string VehicleReg,
    ServiceType ServiceType,
    string? Notes,
    string Reference);
