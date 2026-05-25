# AA SMR Appointment Scheduler

Internal scheduling tool for the AA Service, Maintenance & Repair team. Replaces shared spreadsheets and calendars with a minimum viable booking system.

---

## How to run it

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for SQL Server)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)

### 1. Configure environment (one-time)
```powershell
Copy-Item .env.example .env
# Open .env and set a strong SA password, e.g.:
# MSSQL_SA_PASSWORD=YourStrong_Passw0rd!
```

### 2. Start SQL Server
```powershell
docker-compose up -d
```
Wait ~20 seconds for the container health check to pass.

### 3. Install frontend dependencies (one-time)
```powershell
cd frontend
npm install
```

### 4. Start the backend API (new terminal)
```powershell
cd backend
dotnet run --project SMR.Api/SMR.Api.csproj --urls http://localhost:5000
```
On first run the API applies all EF Core migrations and seeds Leeds Branch, three mechanics (Dave, Sarah, Tom), and 42 slots across the next 7 days automatically.

### 5. Start the frontend (new terminal)
```powershell
cd frontend
npm run dev
```
Open **http://localhost:5173** in your browser.

### 6. Run Playwright E2E smoke tests (optional)
Requires the backend and frontend already running (steps 4 & 5).
```powershell
cd e2e
npx playwright install chromium   # one-time
npx playwright test
```

---

## Stack

**Option A** — React + Vite + TypeScript (frontend) · .NET 8 Web API (backend) · SQL Server via Docker · Entity Framework Core

**Why:** Strong typing end-to-end, EF Core migrations for zero-setup schema management, Vite for fast local dev iteration. Better separation of concerns than Blazor, not confined to C#-only developers, and SEO is not a requirement for an internal tool.

---

## What's done / what's not

Requirements mapped directly against the brief.

### Customer / Booking-Agent Flow ✅ Complete

| Requirement | Status | Notes |
|---|---|---|
| View available slots for next 7 days | ✅ Done | 7-column calendar grid |
| Filter slots by service type | ✅ Done | Dropdown pre-fills booking modal |
| Book: customer name | ✅ Done | Required field |
| Book: customer phone number | ✅ Done | Required field |
| Book: vehicle registration | ✅ Done | Required field |
| Book: service type | ✅ Done | Inspection / Service / Repair / Diagnostics |
| Book: notes / description of issue | ✅ Done | Optional, 500 char limit |
| Multi-branch / multi-location support | ✅ Done | Branch selector, `GET /api/v1/branches` |
| Prevent double-booking | ✅ Done | `IsBooked` flag + EF concurrency exception → 409 |
| Booking confirmation with unique reference | ✅ Done | `SMR-XXXXXXXX` format, shown in confirmation modal |

### Mechanic Flow ⚠️ Partial

| Requirement | Status | Notes |
|---|---|---|
| View appointments assigned to them | ✅ Done | `GET /api/v1/appointments?mechanicId=` |
| See customer details, vehicle, notes | ✅ Done | All fields shown in mechanic view |
| Add work notes (free text, timestamped) | ❌ Not built | Would need a new `WorkNote` entity and `POST /api/v1/appointments/{id}/notes` endpoint |
| Update status: Scheduled → In Progress → Completed / No-Show | ❌ Not built | Would need a `Status` column on `Appointment` and a `PATCH` endpoint |

### Admin / Shared ❌ Not built

| Requirement | Status | Notes |
|---|---|---|
| Today's schedule across all mechanics | ❌ Not built | Would be a `GET /api/v1/schedule?date=` query joining all mechanics and their slots for a given day |

---

## What I'd do with more time

I wanted to showcase using superpowers to plan and build using spec driven development - however, inhindsight it was quite slow compared to creating a wireframe on Figma - however for this kind of interview setting, Figma would have been quicker and simplified the build. the superpower brainstorming got into too much detail.

The actual UX suffered from using superpowers - and highlights the limitations of using agents for visual/UX tasks.

1. **Mechanic work notes** — `WorkNote` entity (AppointmentId, Text, CreatedAt), endpoint `POST /api/v1/appointments/{id}/notes`, displayed chronologically in the mechanic view.
2. **Appointment status lifecycle** — `Status` enum (Scheduled / InProgress / Completed / NoShow) on `Appointment`, `PATCH /api/v1/appointments/{id}/status`, mechanic can update from their view.
3. **Admin today's schedule** — single query across all mechanics for the current day, displayed as a read-only board grouped by mechanic.
4. **Mobile-responsive layout** — the 7-column grid collapses poorly on small screens.
5. **The filter actually filters** — currently the service type dropdown pre-fills the booking modal but does not filter the slot list (slots are bookable for any service type). If mechanics were to specialise, slots would need a `ServiceTypes` tag and the filter would hit the API.

---

## Known bugs / rough edges

- **Seed is date-relative** — slots are created from `DateTime.UtcNow` at first run. If the API has been running for more than 7 days without a DB reset, the seeded slots will have passed and the calendar will show empty.
- **No per-slot duration variance** — all slots are 2 hours. A diagnostics job and a full service take different amounts of time in reality.
- **appsettings.Development.json** — excluded from git (contains the SA password). New developers must copy from `.env.example` and set their own password to match.

---

## AI tooling

**Claude Code** (claude-sonnet-4-6) used throughout all phases — brainstorming, spec writing, implementation planning, TDD execution, debugging, and frontend scaffolding.

Prompts log: [`docs/prompts.md`](docs/prompts.md)

---

## Planning

Followed **Spec-Driven Development (SDD)**:

1. `/brainstorm` — conversational design session to produce the PRD (stack choice, data model, assumptions)
2. Implementation plan — broken into numbered micro-tasks per sprint to avoid token overruns
3. **TDD vertical slices** — Red → Green → merge to dev for every backend endpoint
4. Feature branches off `dev`, explicit `--no-ff` merge commits to simulate PR history
5. Final merge `dev → main` at end

---

## Assumptions

Design decisions not explicitly stated in the brief:

- **Mechanics are branch-scoped.** A mechanic belongs to one branch. Cross-branch assignment would require travel-time modelling — noted as a future enhancement.
- **No forced lunch break.** The brief does not specify a lunch closure; mechanics manage their own breaks outside the system.
- **Working hours 08:00–20:00 every day.** The brief does not specify hours; uniform hours were chosen for simplicity. Slot times are data-driven and can be changed without code changes.
- **Service type lives on the Appointment, not the Slot.** Any mechanic can perform any service type, so slots are not tagged. The filter dropdown is a booking-form convenience, not a data-level filter.

---

## Out of scope (per brief)

- Authentication / real login
- Email or SMS notifications
- Rescheduling and cancellation flows
- Recurring appointments
- Payments / invoicing
- Mobile-specific UI
