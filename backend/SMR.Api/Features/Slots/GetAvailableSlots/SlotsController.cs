using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace SMR.Api.Features.Slots.GetAvailableSlots;

[ApiController]
[Route("api/v{version:apiVersion}/slots")]
[ApiVersion("1.0")]
public sealed class SlotsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SlotsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAvailableSlotsAsync([FromQuery] Guid branchId, CancellationToken cancellationToken)
    {
        List<SlotDto> slots = await _mediator.Send(new GetAvailableSlotsQuery(branchId), cancellationToken);
        return Ok(slots);
    }
}
