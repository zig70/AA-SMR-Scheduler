using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace SMR.Api.Features.Branches.GetBranches;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/branches")]
public sealed class BranchesController : ControllerBase
{
    private readonly IMediator _mediator;

    public BranchesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetBranchesAsync(CancellationToken cancellationToken)
    {
        List<BranchDto> branches = await _mediator.Send(new GetBranchesQuery(), cancellationToken);
        return Ok(branches);
    }
}
