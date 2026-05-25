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
On first run the API applies the database migration and seeds Leeds Branch, three mechanics (Dave, Sarah, Tom), and 42 slots across the next 7 days automatically.

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

## What's done / what's not

---

## Stack

**Option A** — React + Vite + TypeScript (frontend) · .NET 8 Web API (backend) · SQL Server via Docker · Entity Framework Core

Chosen for: strong typing end-to-end, EF Core migrations for zero-setup schema, Vite for fast local dev iteration.
Better separation of concerns, not confined by C# devs only, the SEO benefits of Blazor not required
---

## What's done / what's not

### Done
- **GET /api/v1/slots?branchId=** — returns available slots for a branch
- **POST /api/v1/appointments** — books a slot (optimistic concurrency, 409 on double-book)
- **GET /api/v1/appointments?mechanicId=** — returns a mechanic's booked appointments
- EF Core migrations + auto-seed on first run (branch, mechanics, 7 days of slots)
- React + Vite frontend: 7-column slot calendar, booking modal, mechanic appointments view
- Act-As identity switcher (Admin / Mechanic Dave / Mechanic Sarah)
- Playwright E2E smoke suite (booking path + mechanic context switch)
- GitHub Actions CI (backend build + lint + tests, frontend lint + build, E2E)

### Not done (future enhancements)
- Authentication / real user login
- SMS / Email notifications
- Cancellation and rescheduling
- Mobile-responsive layout
- Admin slot management UI

---

## Known bugs / rough edges

_To be completed during implementation._

---

## AI tooling

Claude Code (claude-sonnet-4-6) used throughout. Prompts saved in session transcript.

---

## Planning

Spec-Driven Development (SDD) process: Brainstorm → PRD → Implementation Plan → TDD vertical slices.

---

## Assumptions

The following are design decisions not explicitly stated in the brief but required to build a coherent system:

- **Mechanics are branch-scoped.** Each mechanic is assigned to a single branch. A mechanic cannot be booked across multiple branches simultaneously, as this would not account for transit time and is operationally impractical. If cross-branch mechanic assignment is needed in future, it would require availability windows and travel time modelling — noted as a future enhancement.

- **No forced lunch break gap in the slot grid.** The brief does not specify a lunch closure. Slots run continuously from opening to closing time. Mechanics manage their own breaks outside the system.

- **Working hours: 08:00–20:00 every day.** The brief does not specify hours; uniform daily hours were chosen for flexibility and simplicity. 12 hourly slots per mechanic per day are seeded. Slot times are data-driven and can be adjusted without code changes.

---

## Future enhancements (out of scope for MVP)

- Authentication / login flows
- SMS / Email booking notifications
- Rescheduling and cancellation flows
- Recurring appointments
- Payments and invoicing
- Mobile-responsive UI
- Cross-branch mechanic assignment with travel time modelling
