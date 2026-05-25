# Sprint 0 — Step 2: Backend .NET 8 API Scaffold

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a controller-based .NET 8 Web API project and its xUnit integration test companion, wire up all four core dependencies (EF Core, MediatR, FluentValidation, Asp.Versioning), establish the Vertical Slice folder layout, and prove the scaffold is alive with a passing `/health` integration test.

**Architecture:** Two projects live inside `./backend/` under a single `SMR.sln`. The API project (`SMR.Api`) uses controller-based routing with Vertical Slice organisation under `Features/`. The test project (`SMR.Tests`) references `SMR.Api` and uses `WebApplicationFactory<Program>` with an in-memory database override so tests never need Docker. All services are registered in a single `Program.cs` (no `Startup.cs`).

**Tech Stack:** .NET 8 · EF Core 8.x (`Microsoft.EntityFrameworkCore.SqlServer 8.*`) · MediatR 12.x · FluentValidation 12.x (+ `FluentValidation.DependencyInjectionExtensions`) · `Asp.Versioning.Mvc 8.*` · xUnit · `Microsoft.AspNetCore.Mvc.Testing 8.*` · FluentAssertions 7.x · `Microsoft.EntityFrameworkCore.InMemory 8.*`

> **Package note (verified via Context7, 2026-05-25):** FluentValidation 12 is the current release and targets .NET 8+ minimum. `FluentValidation.AspNetCore` is deprecated — use `FluentValidation.DependencyInjectionExtensions` instead. All `8.*` version pins keep the project on the EF Core / ASP.NET Core 8 LTS series.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/SMR.sln` | Create | Solution envelope for both projects |
| `backend/SMR.Api/SMR.Api.csproj` | Create | API project definition with TreatWarningsAsErrors |
| `backend/SMR.Api/Program.cs` | Create | Service registration + minimal pipeline |
| `backend/SMR.Api/appsettings.json` | Create | Logging config + empty connection string placeholder |
| `backend/SMR.Api/appsettings.Development.json` | Create | Local dev connection string (SA password, localhost) |
| `backend/SMR.Api/Infrastructure/Data/AppDbContext.cs` | Create | Empty EF Core DbContext shell |
| `backend/SMR.Tests/SMR.Tests.csproj` | Create | xUnit test project referencing SMR.Api |
| `backend/SMR.Tests/Infrastructure/TestWebApplicationFactory.cs` | Create | Swaps SQL Server for in-memory DB in all tests |
| `backend/SMR.Tests/Features/Health/HealthEndpointTests.cs` | Create | First integration test — proves app boots |

---

### Task 1: Create and switch to feature branch

**Files:** none

---

- [ ] **Step 1: Create and checkout the branch from `dev`**

```powershell
git checkout -b infra/backend-scaffold
```

Expected: `Switched to a new branch 'infra/backend-scaffold'`

---

### Task 2: Scaffold solution and projects

**Files:**
- Create: `backend/SMR.sln`
- Create: `backend/SMR.Api/SMR.Api.csproj` (and template files)
- Create: `backend/SMR.Tests/SMR.Tests.csproj` (and template files)

---

- [ ] **Step 1: Create the solution**

```powershell
dotnet new sln -n SMR --output backend
```

Expected: `The template "Solution File" was created successfully.`

- [ ] **Step 2: Scaffold the Web API project (controller-based, no OpenAPI template)**

```powershell
dotnet new webapi -n SMR.Api --output backend/SMR.Api --use-controllers --no-openapi
```

Expected: `The template "ASP.NET Core Web API" was created successfully.`

- [ ] **Step 3: Scaffold the xUnit test project**

```powershell
dotnet new xunit -n SMR.Tests --output backend/SMR.Tests
```

Expected: `The template "xUnit Test Project" was created successfully.`

- [ ] **Step 4: Add both projects to the solution**

```powershell
dotnet sln backend/SMR.sln add backend/SMR.Api/SMR.Api.csproj backend/SMR.Tests/SMR.Tests.csproj
```

Expected: Both `.csproj` paths reported as added.

- [ ] **Step 5: Add project reference from Tests → API**

```powershell
dotnet add backend/SMR.Tests/SMR.Tests.csproj reference backend/SMR.Api/SMR.Api.csproj
```

Expected: `Reference ..\SMR.Api\SMR.Api.csproj added to the project.`

- [ ] **Step 6: Delete template boilerplate from SMR.Api**

The template generates files we do not want:

```powershell
Remove-Item backend/SMR.Api/Controllers/WeatherForecastController.cs
Remove-Item backend/SMR.Api/WeatherForecast.cs
```

Expected: Both files deleted without error. (Ignore if a file does not exist — template output varies by SDK version.)

- [ ] **Step 7: Delete template boilerplate from SMR.Tests**

```powershell
Remove-Item backend/SMR.Tests/UnitTest1.cs
```

Expected: File deleted.

- [ ] **Step 8: Enable TreatWarningsAsErrors in SMR.Api.csproj**

Open `backend/SMR.Api/SMR.Api.csproj`. The generated file looks like this (exact property values may differ slightly by SDK version):

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
```

Replace it in full with:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <Deterministic>true</Deterministic>
  </PropertyGroup>
</Project>
```

- [ ] **Step 9: Enable TreatWarningsAsErrors in SMR.Tests.csproj**

Open `backend/SMR.Tests/SMR.Tests.csproj`. Replace in full:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.*" />
    <PackageReference Include="xunit" Version="2.*" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.*">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="coverlet.collector" Version="6.*">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\SMR.Api\SMR.Api.csproj" />
  </ItemGroup>
</Project>
```

Note: The `dotnet new xunit` template already adds these packages. This step consolidates them and enables `TreatWarningsAsErrors`. The `ProjectReference` was added by Step 5 and will already be present — do not duplicate it.

---

### Task 3: Add NuGet packages to SMR.Api

**Files:**
- Modify: `backend/SMR.Api/SMR.Api.csproj` (packages added automatically by dotnet CLI)

---

- [ ] **Step 1: Add EF Core SQL Server provider**

```powershell
dotnet add backend/SMR.Api/SMR.Api.csproj package Microsoft.EntityFrameworkCore.SqlServer --version "8.*"
```

Expected: `PackageReference for package 'Microsoft.EntityFrameworkCore.SqlServer' version '8.x.x' added to file ...`

- [ ] **Step 2: Add EF Core Tools (for migrations — dev only)**

```powershell
dotnet add backend/SMR.Api/SMR.Api.csproj package Microsoft.EntityFrameworkCore.Tools --version "8.*"
```

Expected: Package reference added.

- [ ] **Step 3: Add MediatR**

```powershell
dotnet add backend/SMR.Api/SMR.Api.csproj package MediatR --version "12.*"
```

Expected: Package reference added.

- [ ] **Step 4: Add FluentValidation core library**

```powershell
dotnet add backend/SMR.Api/SMR.Api.csproj package FluentValidation --version "12.*"
```

Expected: Package reference added.

- [ ] **Step 5: Add FluentValidation DI extensions**

```powershell
dotnet add backend/SMR.Api/SMR.Api.csproj package FluentValidation.DependencyInjectionExtensions --version "12.*"
```

Expected: Package reference added.

- [ ] **Step 6: Add API versioning for MVC controllers**

```powershell
dotnet add backend/SMR.Api/SMR.Api.csproj package Asp.Versioning.Mvc --version "8.*"
```

Expected: Package reference added.

- [ ] **Step 7: Verify the API project restores cleanly**

```powershell
dotnet restore backend/SMR.Api/SMR.Api.csproj
```

Expected: `Restore succeeded.` — no errors.

---

### Task 4: Add NuGet packages to SMR.Tests

**Files:**
- Modify: `backend/SMR.Tests/SMR.Tests.csproj`

---

- [ ] **Step 1: Add WebApplicationFactory support**

```powershell
dotnet add backend/SMR.Tests/SMR.Tests.csproj package Microsoft.AspNetCore.Mvc.Testing --version "8.*"
```

Expected: Package reference added.

- [ ] **Step 2: Add FluentAssertions**

```powershell
dotnet add backend/SMR.Tests/SMR.Tests.csproj package FluentAssertions --version "7.*"
```

Expected: Package reference added.

- [ ] **Step 3: Add EF Core in-memory provider (for test DB override)**

```powershell
dotnet add backend/SMR.Tests/SMR.Tests.csproj package Microsoft.EntityFrameworkCore.InMemory --version "8.*"
```

Expected: Package reference added.

- [ ] **Step 4: Verify the test project restores cleanly**

```powershell
dotnet restore backend/SMR.Tests/SMR.Tests.csproj
```

Expected: `Restore succeeded.`

---

### Task 5: Establish folder layout and Infrastructure shell

**Files:**
- Create: `backend/SMR.Api/Infrastructure/Data/AppDbContext.cs`
- Create: `backend/SMR.Api/Features/` (directory)

---

- [ ] **Step 1: Create the Infrastructure/Data directory and AppDbContext shell**

Create file `backend/SMR.Api/Infrastructure/Data/AppDbContext.cs`:

```csharp
using Microsoft.EntityFrameworkCore;

namespace SMR.Api.Infrastructure.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
}
```

This is the EF Core context. Entity DbSet properties are added in feature-specific migrations sprints.

- [ ] **Step 2: Create the Features directory**

```powershell
New-Item -ItemType Directory -Path backend/SMR.Api/Features -Force
```

Expected: Directory created. (No files yet — feature slices are added per-sprint.)

- [ ] **Step 3: Replace template Program.cs with a minimal compilable shell**

The template `Program.cs` references types we just deleted. Replace `backend/SMR.Api/Program.cs` in full with a minimal shell that compiles cleanly. The full service wiring comes in Task 7.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();
app.MapControllers();

app.Run();

public partial class Program { }
```

The `public partial class Program { }` sentinel at the bottom is required for `WebApplicationFactory<Program>` in the test project to compile.

- [ ] **Step 4: Verify the minimal shell compiles**

```powershell
dotnet build backend/SMR.sln
```

Expected: `Build succeeded.` with `0 Error(s)`.

- [ ] **Step 5: Create appsettings.json**

Replace the generated `backend/SMR.Api/appsettings.json` in full:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": ""
  }
}
```

The connection string is intentionally empty here — it is populated by environment-specific overrides.

- [ ] **Step 6: Create appsettings.Development.json**

Replace (or create) `backend/SMR.Api/appsettings.Development.json` in full:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=SmrDb;User Id=SA;Password=Dev_Local_P@ss1!;TrustServerCertificate=True;"
  }
}
```

**Important:** Update the `Password` value to match your local `.env` SA password if you changed it from the default.

---

### Task 6: Write the failing integration test (TDD Red)

**Files:**
- Create: `backend/SMR.Tests/Infrastructure/TestWebApplicationFactory.cs`
- Create: `backend/SMR.Tests/Features/Health/HealthEndpointTests.cs`

The test verifies `GET /health` returns `200 OK`. It will fail because `Program.cs` has not been wired up yet.

---

- [ ] **Step 1: Create the TestWebApplicationFactory**

Create `backend/SMR.Tests/Infrastructure/TestWebApplicationFactory.cs`:

```csharp
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SMR.Api.Infrastructure.Data;

namespace SMR.Tests.Infrastructure;

public sealed class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            ServiceDescriptor? descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("SmrTestDb"));
        });
    }
}
```

This replaces the SQL Server DbContext with an in-memory database so tests run without Docker.

- [ ] **Step 2: Create the Health endpoint test**

Create directory: `backend/SMR.Tests/Features/Health/`

Create `backend/SMR.Tests/Features/Health/HealthEndpointTests.cs`:

```csharp
using System.Net;
using FluentAssertions;
using SMR.Tests.Infrastructure;

namespace SMR.Tests.Features.Health;

public sealed class HealthEndpointTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_ReturnsOk()
    {
        HttpResponseMessage response = await _client.GetAsync("/health");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
```

- [ ] **Step 3: Run the test — verify it FAILS**

```powershell
dotnet test backend/SMR.Tests/SMR.Tests.csproj
```

The minimal `Program.cs` from Task 5 compiles cleanly, so the test runs but `GET /health` returns `404 Not Found` because the health check endpoint has not been mapped yet.

Expected output (assertion failure):
```
Expected value to be HttpStatusCode.OK {value: 200}, but found HttpStatusCode.NotFound {value: 404}.
Failed! - Failed: 1, Passed: 0
```

This is the intentional Red state.

---

### Task 7: Wire Program.cs (TDD Green)

**Files:**
- Modify: `backend/SMR.Api/Program.cs`

---

- [ ] **Step 1: Replace Program.cs entirely**

Replace `backend/SMR.Api/Program.cs` in full:

```csharp
using Asp.Versioning;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SMR.Api.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
})
.AddMvc();

builder.Services.AddControllers();
builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseHttpsRedirection();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

public partial class Program { }
```

The `public partial class Program { }` at the bottom is required — it exposes `Program` as a type so `WebApplicationFactory<Program>` in the test project can reference it.

- [ ] **Step 2: Run the test — verify it PASSES**

```powershell
dotnet test backend/SMR.Tests/SMR.Tests.csproj -v normal
```

Expected output:
```
Passed  SMR.Tests.Features.Health.HealthEndpointTests.GetHealth_ReturnsOk
...
Passed! - Failed: 0, Passed: 1, Skipped: 0, Total: 1
```

---

### Task 8: Verify build quality

**Files:** none modified

---

- [ ] **Step 1: Run Roslyn format check**

```powershell
dotnet format backend/SMR.sln --verify-no-changes
```

Expected: `Format complete. Files that would be changed: 0.`

If any files would be changed, run `dotnet format backend/SMR.sln` (without `--verify-no-changes`) to auto-fix, then re-check.

- [ ] **Step 2: Run full build with warnings-as-errors**

```powershell
dotnet build backend/SMR.sln --configuration Release /p:TreatWarningsAsErrors=true
```

Expected: `Build succeeded.` with `0 Warning(s)` and `0 Error(s)`.

- [ ] **Step 3: Run all tests**

```powershell
dotnet test backend/SMR.sln --configuration Release --no-build
```

Expected: `Passed! - Failed: 0, Passed: 1`

---

### Task 9: Commit

- [ ] **Step 1: Stage and commit the scaffold**

```bash
git add backend/
git commit -m "feat(backend): scaffold SMR.Api and SMR.Tests with EF Core, MediatR, FluentValidation, Asp.Versioning"
```
