using FluentValidation;

namespace SMR.Api.Features.Slots.GetAvailableSlots;

public sealed class GetAvailableSlotsValidator : AbstractValidator<GetAvailableSlotsQuery>
{
    public GetAvailableSlotsValidator()
    {
        RuleFor(x => x.BranchId).NotEmpty();
    }
}
