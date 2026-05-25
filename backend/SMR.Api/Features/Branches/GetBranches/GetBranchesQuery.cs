using MediatR;

namespace SMR.Api.Features.Branches.GetBranches;

public sealed record GetBranchesQuery : IRequest<List<BranchDto>>;
