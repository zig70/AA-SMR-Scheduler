namespace SMR.Api.Features.Slots.GetAvailableSlots;

public record SlotDto(Guid SlotId, string MechanicName, DateTime StartTime, DateTime EndTime);
