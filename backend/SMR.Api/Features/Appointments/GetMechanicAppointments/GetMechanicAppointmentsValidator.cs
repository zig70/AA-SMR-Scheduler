using FluentValidation;

namespace SMR.Api.Features.Appointments.GetMechanicAppointments;

public sealed class GetMechanicAppointmentsValidator : AbstractValidator<GetMechanicAppointmentsQuery>
{
    public GetMechanicAppointmentsValidator()
    {
        RuleFor(q => q.MechanicId).NotEmpty();
    }
}
