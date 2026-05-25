namespace SMR.Api.Features.Slots.GetAvailableSlots;

public record SlotDto(Guid Id, string MechanicName, DateTime StartTime, DateTime EndTime);
