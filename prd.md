# Product Requirements Document
## AA SMR Appointment Scheduler

**Version:** 1.0  
**Date:** 2026-05-25  
**Status:** Approved for implementation

---

## 1. Problem Statement

The AA SMR (Service, Maintenance & Repair) team currently tracks vehicle bookings in spreadsheets and shared calendars. This causes double-bookings, missed jobs, and lost notes between mechanics. This tool replaces that process with a minimum viable internal scheduling application.

---

## 2. Goals

- Eliminate double-bookings via database-enforced slot constraints
- Give booking agents a clear, scannable view of available capacity across the next 7 days
- Give mechanics a focused view of their own workload and a place to record job notes
- Give admins a live snapshot of today's full workshop floor
- Be fully usable on first run with no manual setup

---

## 3. User Personas

### Booking Agent
Books customer vehicles into available mechanic slots. Needs to see availability at a glance across the week, filter by service type, and complete a booking in as few steps as possible.

### Mechanic
Views their own appointment list for today and tomorrow. Opens individual jobs to read customer notes, add work notes, and update job status as work progresses.

### Admin
Monitors the full workshop schedule for a given branch across all mechanics for today. Read-only oversight — no booking or editing from this view.

---

## 4. Out of Scope (MVP)

The following are explicitly excluded. They should be noted as future enhancements if encountered during build:

- Authentication and login flows (replaced by "Act As" dropdown)
- SMS / Email notifications
- Rescheduling and cancellation flows
- Recurring appointments
- Payments and invoicing
- Mobile-specific responsive UI
- Cross-branch mechanic assignment

---

## 5. Information Architecture

### Identity Simulation

No authentication is built. A global **"Act As"** dropdown in the fixed header controls which persona's view is rendered:

- `Booking Agent`
- `Mechanic: [Name]` — one entry per seeded mechanic
- `Admin`

### Branch Selection

A **Branch** dropdown in the global header sets the active branch context. Switching branch navigates to the same route scoped to the new branch (full page reload).

### Routes

| Path | Active Role | View |
|---|---|---|
| `/` | Any | Admin home — today's schedule (default branch) |
| `/branches/:branchId/slots` | Booking Agent | 7-day slot grid |
| `/branches/:branchId/mechanics/:mechanicId/jobs` | Mechanic | Today/tomorrow job list |
| `/appointments/:appointmentId` | Mechanic | Appointment detail + work notes |
| `/branches/:branchId/admin` | Admin | Today's full schedule board |

---

## 6. Functional Requirements

### 6.1 Booking Agent — Slot Grid

**Layout:**
- 7-column calendar grid: one column per day, starting from today
- Today's column is highlighted in amber
- Left axis: hourly time labels from 08:00 to 19:00 (12 slots)
- Within each time row: one sub-row per mechanic at the selected branch
- No forced lunch break gap — slots run continuously
- All days run 08:00–20:00 (12 hourly slots: 08:00, 09:00 … 19:00 start times)

**Cell States:**
| State | Visual | Behaviour |
|---|---|---|
| Available | Amber tint, mechanic name visible | Clickable — opens booking drawer |
| Booked | Grey, "Booked" label | Not clickable |
| Past | Muted / low opacity | Not clickable |

**Service Type Filter:**
- Pill/tab filter above the grid: `All · Inspection · Service · Repair · Diagnostics`
- Filters which booked slots are highlighted (shows congestion by type)
- Available slots are always shown regardless of filter

### 6.2 Booking Agent — Booking Drawer

Triggered by clicking an available slot cell.

**Behaviour:**
- Slides in from the right, approximately 400px wide
- Background grid dims to 50% opacity (remains visible for context)
- Slot context displayed at drawer top (mechanic name, date, time) — read-only

**Form Fields:**

| Field | Type | Validation |
|---|---|---|
| Customer Name | Text input | Required |
| Customer Phone | Text input | Required |
| Vehicle Registration | Text input | Required, uppercase |
| Service Type | Dropdown | Required — Inspection, Service, Repair, Diagnostics |
| Notes | Textarea | Optional |

**On Submit:**
- API validates no concurrent booking has claimed the slot (optimistic concurrency check)
- On success: drawer body replaced with a confirmation card showing the **unique booking reference** (format: `SMR-YYYY-{5-digit-sequence}`, e.g. `SMR-2026-00042`)
- The booked slot in the grid turns grey immediately
- On conflict (slot taken since page load): error message shown in drawer — "This slot was just booked. Please choose another."

### 6.3 Mechanic — Job List

Accessed when "Act As: Mechanic [Name]" is selected, scoped to the mechanic's assigned branch.

**Layout:**
- Two sections: **Today** and **Tomorrow**, each collapsible
- Appointments listed in ascending time order within each section
- Each row: time · customer name · vehicle reg · service type · status badge
- Tapping/clicking a row navigates to the appointment detail page

**Status Badge Colours:**
- Scheduled — amber
- In Progress — blue
- Completed — green
- No-Show — red

### 6.4 Mechanic — Appointment Detail

Full detail view for a single appointment.

**Read-only header block:**
- Booking reference · Slot time · Mechanic name
- Customer name · Phone · Vehicle registration
- Service type · Customer notes (as entered at booking time)

**Work Notes Feed:**
- Reverse-chronological list of timestamped work notes added by the mechanic
- Each note: timestamp (UTC, displayed in local time) + note body
- Text area + "Add Note" button at the bottom of the feed
- New notes are appended and immediately visible without a page reload

**Status Control:**
- Segmented button row: `Scheduled | In Progress | Completed | No-Show`
- Active status highlighted in amber
- Clicking a new status updates immediately via API call
- Status badge in the header updates on success
- Transitions are free-form — no enforced state machine (mechanic can mark No-Show from any state)

### 6.5 Admin — Today's Schedule Board

Accessed when "Act As: Admin" is selected, scoped to the selected branch.

**Layout:**
- One card per mechanic at the branch, stacked vertically
- Card header: mechanic name + total job count for today (e.g. "Dave — 8 jobs")
- Within each card: appointments in ascending time order
  - Columns: Time · Customer Name · Vehicle Reg · Service Type · Status badge
- Read-only — no actions available from this view
- Branch switcher in global header allows viewing other branches

---

## 7. Data Model

### Entities

**Branch**
```
Id          int           PK
Name        nvarchar(100) required
Address     nvarchar(255) required
```

**Mechanic**
```
Id          int           PK
Name        nvarchar(100) required
BranchId    int           FK → Branch, required
```

**ServiceType** *(lookup table, seeded)*
```
Id          int           PK
Name        nvarchar(50)  required
```
Seed values: `Inspection`, `Service`, `Repair`, `Diagnostics`

**AppointmentSlot**
```
Id          int           PK
MechanicId  int           FK → Mechanic, required
StartTime   datetime2     required
IsBooked    bit           default false
```
Unique constraint: `(MechanicId, StartTime)` — enforces one slot per mechanic per time.

**Appointment**
```
Id                    int            PK
SlotId                int            FK → AppointmentSlot, unique
ServiceTypeId         int            FK → ServiceType
CustomerName          nvarchar(100)  required
CustomerPhone         nvarchar(20)   required
VehicleRegistration   nvarchar(10)   required
CustomerNotes         nvarchar(1000) nullable
BookingReference      nvarchar(20)   required, computed (SMR-YYYY-{5-digit-zero-padded-sequence})
Status                int            enum: 0=Scheduled, 1=InProgress, 2=Completed, 3=NoShow
RowVersion            rowversion     optimistic concurrency token
```

**WorkNote**
```
Id              int            PK
AppointmentId   int            FK → Appointment, required
Body            nvarchar(2000) required
CreatedAt       datetime2      UTC, required
```

### Relationships

```
Branch ──< Mechanic ──< AppointmentSlot ──── Appointment ──< WorkNote
                                               │
                                          ServiceType
```

### Seed Data

| Entity | Count | Detail |
|---|---|---|
| Branches | 2 | Dublin City, Dublin West |
| Mechanics | 3 per branch (6 total) | e.g. Dave, Sam, Maria / Liam, Emma, Niall |
| Service Types | 4 | Inspection, Service, Repair, Diagnostics |
| Slots | 12/day × 6 mechanics × 14 days | 08:00–19:00 start times, rolling from today |
| Pre-booked appointments | 3–4 per mechanic | Realistic mix of service types and statuses |

---

## 8. Non-Functional Requirements

- **Double-booking prevention:** Unique DB constraint on `(MechanicId, StartTime)` + optimistic concurrency `RowVersion` on `Appointment` — both must be enforced
- **API versioning:** All endpoints versioned under `api/v1/`
- **Validation:** FluentValidation via MediatR pipeline behaviour — 400 returned before handlers execute
- **Error format:** RFC 7807 `ProblemDetails` for all API errors
- **Performance:** `AsNoTracking()` on all read queries
- **Concurrency:** Never use `.Result` or `.Wait()` — all async with `await`
- **Static analysis:** Build must pass with `TreatWarningsAsErrors=true`

---

## 9. UI / Visual Direction

### Brand

AA Motoring aesthetic: dark workshop environment with high-contrast amber call-to-action elements.

### Colour Palette

| Token | Value | Usage |
|---|---|---|
| Page background | `bg-zinc-900` | App shell |
| Panel background | `bg-zinc-800` | Cards, drawer, sidebar |
| Surface | `bg-zinc-700` | Inputs, table rows |
| Primary | `bg-amber-400` / `hover:bg-amber-500` | CTAs, active states, today column |
| Primary text on amber | `text-zinc-950` | High contrast on amber backgrounds |
| Muted text | `text-zinc-400` | Secondary labels |
| Available slot | Amber tint cell | Clickable grid cells |
| Booked slot | `bg-zinc-700 text-zinc-500` | Non-interactive |

### Status Badge Colours

| Status | Colour |
|---|---|
| Scheduled | Amber |
| In Progress | Blue |
| Completed | Green |
| No-Show | Red |

### Component Standards

- Slot cells: `<button>` elements with `aria-label` (e.g. `"Book Dave 09:00 Monday 26 May"`)
- Status control: `<fieldset>` with radio buttons styled as a segmented bar
- All form inputs: visible `<label>` bound via `htmlFor`
- Focus rings: `focus:outline-none focus:ring-2 focus:ring-amber-400`
- Screen-reader labels: `<span className="sr-only">` for icon-only indicators
- Navigation links: `<a>` tags; actions: `<button>` tags
- Structural landmarks: `<header>`, `<main>`, `<nav>`, `<section>`

---

## 10. Assumptions

1. **Mechanics are branch-scoped.** Each mechanic belongs to one branch. Cross-branch assignment not supported in MVP (see README).
2. **No lunch break gap.** Slots run 08:00–19:00 continuously. Mechanics manage their own breaks.
3. **Working hours 08:00–20:00 every day.** 12 hourly slots per mechanic per day seeded uniformly regardless of day of week.
4. **Slot duration is 1 hour.** All service types fit in a 1-hour slot for MVP purposes.
5. **Booking agent does not choose which mechanic** — the mechanic is implicit in the slot selected. The grid makes it visible who owns each slot.
6. **Booking reference is globally unique and sequential** — generated server-side using a scoped sequence or max-ID lookup at insert time.

---

## 11. Acceptance Criteria (Gherkin)

### Feature: View Available Slots

```gherkin
Feature: Booking agent views available appointment slots

  Scenario: Agent sees the 7-day slot grid for a branch
    Given the booking agent has selected branch "Dublin City"
    And the "Act As" dropdown is set to "Booking Agent"
    When they navigate to the slot grid
    Then they see 7 day columns starting from today
    And each column shows hourly slots from 08:00 to 19:00
    And each slot row shows one sub-row per mechanic at the branch

  Scenario: Agent filters slots by service type
    Given the booking agent is viewing the slot grid
    When they select the "Inspection" filter
    Then booked slots with service type "Inspection" are visually distinguished
    And available slots remain visible regardless of service type
```

### Feature: Book an Appointment

```gherkin
Feature: Booking agent books a customer vehicle into a slot

  Scenario: Successful booking
    Given an available slot exists for mechanic "Dave" at 09:00 on the next working day
    When the booking agent clicks that slot
    Then a booking drawer slides in from the right
    And the drawer shows "Dave · [date] · 09:00" as locked context
    When they enter valid customer details and click "Confirm Booking"
    Then the API creates the appointment
    And the drawer shows a booking confirmation with a reference number matching "SMR-2026-\d{5}"
    And the slot cell in the grid turns grey

  Scenario: Double-booking is prevented
    Given slot for mechanic "Dave" at 09:00 is available on the grid
    When two agents attempt to book the same slot simultaneously
    Then only one booking succeeds
    And the second agent sees the error "This slot was just booked. Please choose another."
    And no duplicate appointment exists in the database

  Scenario: Booking with missing required fields
    Given the booking drawer is open for an available slot
    When the agent clicks "Confirm Booking" without entering a customer name
    Then the form shows a validation error on the Customer Name field
    And no API request is made
```

### Feature: Mechanic Views Their Jobs

```gherkin
Feature: Mechanic views their appointment list

  Scenario: Mechanic sees today and tomorrow's jobs
    Given the "Act As" dropdown is set to "Mechanic: Dave"
    When Dave navigates to his job list
    Then he sees a "Today" section and a "Tomorrow" section
    And each section lists his appointments in ascending time order
    And each appointment shows the time, customer name, vehicle reg, service type, and status

  Scenario: No appointments shows empty state
    Given mechanic "Sam" has no appointments today or tomorrow
    When Sam views her job list
    Then she sees an empty state message for each section
```

### Feature: Mechanic Manages an Appointment

```gherkin
Feature: Mechanic adds work notes and updates status

  Scenario: Mechanic adds a work note
    Given mechanic "Dave" has an appointment with reference "SMR-2026-00042"
    When Dave opens that appointment and types "Replaced front brake pads" and clicks "Add Note"
    Then the note appears at the top of the work notes feed
    And the note displays the current timestamp in local time

  Scenario: Mechanic updates appointment status
    Given appointment "SMR-2026-00042" has status "Scheduled"
    When Dave clicks "In Progress" on the status control
    Then the API updates the status to "InProgress"
    And the status badge changes to blue "In Progress"

  Scenario: Mechanic marks a no-show
    Given appointment "SMR-2026-00042" has status "Scheduled"
    When Dave clicks "No-Show" on the status control
    Then the status updates to "NoShow"
    And the badge changes to red "No-Show"
```

### Feature: Admin Views Today's Schedule

```gherkin
Feature: Admin views today's full workshop schedule

  Scenario: Admin sees all mechanics for a branch
    Given the "Act As" dropdown is set to "Admin"
    And branch "Dublin City" is selected
    When the admin views today's schedule
    Then they see one card per mechanic assigned to "Dublin City"
    And each card shows the mechanic's appointments for today in time order
    And each appointment row shows time, customer name, vehicle reg, service type, and status

  Scenario: Admin switches branch
    Given the admin is viewing "Dublin City" schedule
    When they select "Dublin West" from the branch dropdown
    Then the schedule refreshes to show "Dublin West" mechanics and their today's appointments
```

### Feature: Application Seed Data

```gherkin
Feature: Application is usable on first run

  Scenario: Database seeds correctly on first run
    Given the application has never been started before
    When the application starts
    Then 2 branches exist in the database
    And 6 mechanics exist (3 per branch)
    And 4 service types exist (Inspection, Service, Repair, Diagnostics)
    And appointment slots exist for all mechanics for the next 14 days
    And at least 3 pre-booked appointments exist per mechanic with mixed statuses
```
