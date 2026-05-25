using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using SMR.Api.Domain;
using SMR.Api.Infrastructure.Data;
using SMR.Tests.Infrastructure;
using Xunit;

namespace SMR.Tests.Features.Slots;

public sealed class GetAvailableSlotsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public GetAvailableSlotsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetSlots_WithValidBranchId_ReturnsAvailableSlots()
    {
        Guid branchId = await SeedBranchWithAvailableSlotAsync();

        HttpResponseMessage response = await _client.GetAsync($"/api/v1/slots?branchId={branchId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        string json = await response.Content.ReadAsStringAsync();
        using JsonDocument doc = JsonDocument.Parse(json);
        doc.RootElement.GetArrayLength().Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetSlots_WithEmptyBranchId_ReturnsBadRequest()
    {
        HttpResponseMessage response = await _client.GetAsync(
            "/api/v1/slots?branchId=00000000-0000-0000-0000-000000000000");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    private async Task<Guid> SeedBranchWithAvailableSlotAsync()
    {
        using IServiceScope scope = _factory.Services.CreateScope();
        AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Guid branchId = Guid.NewGuid();
        Guid mechanicId = Guid.NewGuid();

        db.Branches.Add(new Branch { Id = branchId, Name = "Bicester Branch" });
        db.Mechanics.Add(new Mechanic { Id = mechanicId, Name = "Dave", BranchId = branchId });
        db.Slots.Add(new Slot
        {
            Id = Guid.NewGuid(),
            BranchId = branchId,
            MechanicId = mechanicId,
            StartTime = DateTime.UtcNow.AddHours(1),
            EndTime = DateTime.UtcNow.AddHours(2),
            IsBooked = false
        });

        await db.SaveChangesAsync();
        return branchId;
    }
}
