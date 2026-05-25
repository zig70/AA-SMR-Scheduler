namespace SMR.Api.Domain;

public class Appointment
{
    public Guid Id { get; set; }
    public Guid SlotId { get; set; }
    public Slot Slot { get; set; } = null!;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string VehicleReg { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
