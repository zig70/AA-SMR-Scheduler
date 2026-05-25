namespace SMR.Api.Domain;

public class Mechanic
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
}
