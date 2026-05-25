using FluentValidation;
using SMR.Api.Domain;

namespace SMR.Api.Features.Appointments.BookAppointment;

public sealed class BookAppointmentValidator : AbstractValidator<BookAppointmentCommand>
{
    public BookAppointmentValidator()
    {
        RuleFor(x => x.SlotId).NotEmpty();
        RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CustomerPhone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.VehicleReg).NotEmpty().MaximumLength(10);
        RuleFor(x => x.ServiceType).NotNull().IsInEnum();
        RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes is not null);
    }
}
