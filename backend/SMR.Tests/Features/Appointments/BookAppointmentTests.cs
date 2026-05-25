using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using SMR.Api.Domain;
using SMR.Api.Infrastructure.Data;
using SMR.Tests.Infrastructure;
using Xunit;

namespace SMR.Tests.Features.Appointments;

public sealed class BookAppointmentTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    public BookAppointmentTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostAppointment_WithValidCommand_Returns201Created()
    {
        Guid slotId = await SeedAvailableSlotAsync("Alice");

        var command = new
        {
            slotId,
            customerName = "Jane Smith",
            customerPhone = "07911123456",
            vehicleReg = "AB12CDE",
            serviceType = "Inspection",
            notes = "Strange noise from engine"
        };

        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/v1/appointments", command);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        string json = await response.Content.ReadAsStringAsync();
        using JsonDocument doc = JsonDocument.Parse(json);
        JsonElement root = doc.RootElement;

        root.GetProperty("appointmentId").GetGuid().Should().NotBeEmpty();
        root.GetProperty("slotId").GetGuid().Should().Be(slotId);
        root.GetProperty("customerName").GetString().Should().Be("Jane Smith");
        root.GetProperty("vehicleReg").GetString().Should().Be("AB12CDE");
        root.GetProperty("mechanicName").GetString().Should().NotBeNullOrWhiteSpace();
        root.GetProperty("serviceType").GetString().Should().Be("Inspection");
        root.GetProperty("notes").GetString().Should().Be("Strange noise from engine");
        root.GetProperty("reference").GetString().Should().StartWith("SMR-").And.HaveLength(12);
    }

    [Fact]
    public async Task PostAppointment_WithoutNotes_Returns201Created()
    {
        Guid slotId = await SeedAvailableSlotAsync("NoNotes");

        var command = new
        {
            slotId,
            customerName = "No Notes Customer",
            customerPhone = "07900000001",
            vehicleReg = "NN11NNN",
            serviceType = "Service"
        };

        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/v1/appointments", command);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        string json = await response.Content.ReadAsStringAsync();
        using JsonDocument doc = JsonDocument.Parse(json);
        doc.RootElement.GetProperty("reference").GetString().Should().StartWith("SMR-");
    }

    [Fact]
    public async Task PostAppointment_SameSlotTwice_SecondRequestReturns409Conflict()
    {
        Guid slotId = await SeedAvailableSlotAsync("Bob");

        var command = new
        {
            slotId,
            customerName = "John Doe",
            customerPhone = "07922345678",
            vehicleReg = "XY22ZZZ",
            serviceType = "Repair"
        };

        HttpResponseMessage first = await _client.PostAsJsonAsync("/api/v1/appointments", command);
        first.StatusCode.Should().Be(HttpStatusCode.Created);

        HttpResponseMessage second = await _client.PostAsJsonAsync("/api/v1/appointments", command);
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task PostAppointment_WithMissingCustomerName_Returns400BadRequest()
    {
        Guid slotId = await SeedAvailableSlotAsync("Carol");

        var command = new
        {
            slotId,
            customerName = "",
            customerPhone = "07933456789",
            vehicleReg = "CD33EFG",
            serviceType = "Diagnostics"
        };

        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/v1/appointments", command);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task PostAppointment_WithMissingServiceType_Returns400BadRequest()
    {
        Guid slotId = await SeedAvailableSlotAsync("Derek");

        var command = new
        {
            slotId,
            customerName = "Derek Customer",
            customerPhone = "07944567890",
            vehicleReg = "DE44FGH"
            // serviceType intentionally omitted
        };

        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/v1/appointments", command);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    private async Task<Guid> SeedAvailableSlotAsync(string mechanicName)
    {
        using IServiceScope scope = _factory.Services.CreateScope();
        AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Guid branchId = Guid.NewGuid();
        Guid mechanicId = Guid.NewGuid();
        Guid slotId = Guid.NewGuid();

        db.Branches.Add(new Branch { Id = branchId, Name = "Oxford Branch" });
        db.Mechanics.Add(new Mechanic { Id = mechanicId, Name = mechanicName, BranchId = branchId });
        db.Slots.Add(new Slot
        {
            Id = slotId,
            BranchId = branchId,
            MechanicId = mechanicId,
            StartTime = DateTime.UtcNow.AddHours(3),
            EndTime = DateTime.UtcNow.AddHours(4),
            IsBooked = false
        });

        await db.SaveChangesAsync();
        return slotId;
    }
}
