namespace SMR.Api.Domain;

public class Slot
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    public Guid MechanicId { get; set; }
    public Mechanic Mechanic { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsBooked { get; set; }
}
