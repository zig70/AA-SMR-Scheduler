using MediatR;

namespace SMR.Api.Features.Appointments.GetMechanicAppointments;

public sealed record GetMechanicAppointmentsQuery(Guid MechanicId)
    : IRequest<List<MechanicAppointmentDto>>;
