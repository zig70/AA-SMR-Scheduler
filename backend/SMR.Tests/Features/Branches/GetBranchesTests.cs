using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using SMR.Api.Domain;
using SMR.Api.Infrastructure.Data;
using SMR.Tests.Infrastructure;
using Xunit;

namespace SMR.Tests.Features.Branches;

public sealed class GetBranchesTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public GetBranchesTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetBranches_ReturnsSeededBranches()
    {
        await SeedBranchAsync("Manchester Branch");

        HttpResponseMessage response = await _client.GetAsync("/api/v1/branches");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        string json = await response.Content.ReadAsStringAsync();
        using JsonDocument doc = JsonDocument.Parse(json);
        JsonElement root = doc.RootElement;

        root.GetArrayLength().Should().BeGreaterThan(0);
        JsonElement first = root[0];
        first.GetProperty("id").GetGuid().Should().NotBeEmpty();
        first.GetProperty("name").GetString().Should().NotBeNullOrWhiteSpace();
    }

    private async Task SeedBranchAsync(string name)
    {
        using IServiceScope scope = _factory.Services.CreateScope();
        AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Branches.Add(new Branch { Id = Guid.NewGuid(), Name = name });
        await db.SaveChangesAsync();
    }
}
