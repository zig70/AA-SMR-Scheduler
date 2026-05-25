# AA SMR Appointment Scheduler

Internal scheduling tool for the AA Service, Maintenance & Repair team. Replaces shared spreadsheets and calendars with a minimum viable booking system.

---

## How to run it

_To be completed during implementation._

---

## Stack

**Option A** — React + Vite + TypeScript (frontend) · .NET 8 Web API (backend) · SQL Server via Docker · Entity Framework Core

Chosen for: strong typing end-to-end, EF Core migrations for zero-setup schema, Vite for fast local dev iteration.
Better separation of concerns, not confined by C# devs only, the SEO benefits of Blazor not required
---

## What's done / what's not

_To be completed during implementation._

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
