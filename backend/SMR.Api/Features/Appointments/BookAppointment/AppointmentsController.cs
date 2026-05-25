using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using SMR.Api.Features.Appointments.GetMechanicAppointments;

namespace SMR.Api.Features.Appointments.BookAppointment;

[ApiController]
[Route("api/v{version:apiVersion}/appointments")]
[ApiVersion("1.0")]
public sealed class AppointmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AppointmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> BookAppointmentAsync(
        [FromBody] BookAppointmentCommand command,
        CancellationToken cancellationToken)
    {
        AppointmentDto dto = await _mediator.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, dto);
    }

    [HttpGet]
    public async Task<IActionResult> GetMechanicAppointmentsAsync(
        [FromQuery] Guid mechanicId,
        CancellationToken cancellationToken)
    {
        List<MechanicAppointmentDto> appointments = await _mediator.Send(
            new GetMechanicAppointmentsQuery(mechanicId), cancellationToken);
        return Ok(appointments);
    }
}
