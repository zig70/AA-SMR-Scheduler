using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using SMR.Api.Domain;
using SMR.Api.Infrastructure.Data;
using SMR.Tests.Infrastructure;
using Xunit;

namespace SMR.Tests.Features.Appointments;

public sealed class GetMechanicAppointmentsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public GetMechanicAppointmentsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAppointments_WithValidMechanicId_ReturnsBookedAppointments()
    {
        Guid mechanicId = await SeedMechanicWithAppointmentAsync("Dave");

        HttpResponseMessage response = await _client.GetAsync($"/api/v1/appointments?mechanicId={mechanicId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        string json = await response.Content.ReadAsStringAsync();
        using JsonDocument doc = JsonDocument.Parse(json);
        doc.RootElement.GetArrayLength().Should().BeGreaterThan(0);
        JsonElement first = doc.RootElement[0];
        first.GetProperty("mechanicName").GetString().Should().Be("Dave");
        first.GetProperty("appointmentId").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetAppointments_WithEmptyMechanicId_ReturnsBadRequest()
    {
        HttpResponseMessage response = await _client.GetAsync(
            "/api/v1/appointments?mechanicId=00000000-0000-0000-0000-000000000000");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetAppointments_WithUnknownMechanicId_ReturnsEmptyArray()
    {
        HttpResponseMessage response = await _client.GetAsync(
            $"/api/v1/appointments?mechanicId={Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        string json = await response.Content.ReadAsStringAsync();
        using JsonDocument doc = JsonDocument.Parse(json);
        doc.RootElement.GetArrayLength().Should().Be(0);
    }

    private async Task<Guid> SeedMechanicWithAppointmentAsync(string mechanicName)
    {
        using IServiceScope scope = _factory.Services.CreateScope();
        AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Guid branchId = Guid.NewGuid();
        Guid mechanicId = Guid.NewGuid();
        Guid slotId = Guid.NewGuid();
        Guid appointmentId = Guid.NewGuid();

        db.Branches.Add(new Branch { Id = branchId, Name = "Leeds Branch" });
        db.Mechanics.Add(new Mechanic { Id = mechanicId, Name = mechanicName, BranchId = branchId });
        db.Slots.Add(new Slot
        {
            Id = slotId,
            BranchId = branchId,
            MechanicId = mechanicId,
            StartTime = DateTime.UtcNow.AddHours(1),
            EndTime = DateTime.UtcNow.AddHours(2),
            IsBooked = true
        });
        db.Appointments.Add(new Appointment
        {
            Id = appointmentId,
            SlotId = slotId,
            CustomerName = "Test Customer",
            CustomerPhone = "07900000000",
            VehicleReg = "TE57TST",
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync();
        return mechanicId;
    }
}
