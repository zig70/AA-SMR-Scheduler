using MediatR;
using Microsoft.EntityFrameworkCore;
using SMR.Api.Infrastructure.Data;

namespace SMR.Api.Features.Branches.GetBranches;

public sealed class GetBranchesHandler : IRequestHandler<GetBranchesQuery, List<BranchDto>>
{
    private readonly AppDbContext _db;

    public GetBranchesHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<BranchDto>> Handle(GetBranchesQuery request, CancellationToken cancellationToken)
    {
        List<BranchDto> branches = await _db.Branches
            .AsNoTracking()
            .OrderBy(b => b.Name)
            .Select(b => new BranchDto(b.Id, b.Name))
            .ToListAsync(cancellationToken);

        return branches;
    }
}
