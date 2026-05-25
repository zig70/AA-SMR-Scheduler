using MediatR;

namespace SMR.Api.Features.Slots.GetAvailableSlots;

public record GetAvailableSlotsQuery(Guid BranchId) : IRequest<List<SlotDto>>;
