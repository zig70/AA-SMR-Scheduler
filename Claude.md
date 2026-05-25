# CLAUDE.md - SMR Appointment Scheduler Guidance

# Overview
The application is a small internal scheduling application for the AA's - - - Service, Maintenance & Repair (SMR) team

The AA SMR team books in customer vehicles for inspections, maintenance, - - and repair work. Today this is tracked in spreadsheets and shared calendars, which can cause double-bookings, missed jobs, and lost notes between mechanics. You're being asked to build a minimum viable internal tool to replace this process.

Source of Truth Reference: The absolute functional source of truth for this SMR Scheduler is the official AA task brief located at Documentation/AI_Coding_interview_Assignment.pdf. The agent MUST read and parse this file prior to brainstorming, resolving any architectural questions or scope constraints directly against its text.

## MCP Tools — Use These First

**Context7 is configured. Always call it before writing any package version, GitHub Action version, or external dependency reference.**

```
use context7
```

Use Context7 to resolve: NuGet package versions, GitHub Actions tags (aquasecurity/trivy-action, snyk/actions, etc.), Docker base image tags, npm packages. Never guess versions from training data.

## 🦾 Framework, Agent & Git Strategy
- **Execution Workflow**: We are strictly adhering to the `obra/superpowers` agentic skill framework (Brainstorm -> Spec -> Plan -> TDD Tasks).
- **Testing Cycle**: Do not bypass the Red-Green-Refactor cycle. Every functional change must start with a failing test written by the agent before implementation code is generated.
- **Session Management**: If context window metrics grow bloated mid-implementation (over 40%), run the `/compact` command to drop old compiler artifacts, logs, and verbose execution histories. Never execute a blind `/clear` without immediately pointing the agent back to its active task/plan file using `/resume_plan`.

## 🌿 Git Flow & Branch Management Rules
- **Protected Main**: Never commit or push directly to the `main` branch. All work must be developed in isolation.
- **Branch Naming Convention**:
  - Base Infrastructure: `infra/setup-core`
  - Customer Features: `feature/customer-booking` or `feature/slot-filtering`
  - Mechanic Features: `feature/mechanic-dash` or `feature/work-notes`
  - E2E Testing: `test/playwright-smoke`
  - Bug Fixes: `bugfix/issue-description`
- **Development & PR Simulation**: 
  - The local repository will maintain a `dev` branch as the integration target. 
  - Feature branches will branch off `dev`. 
  - Once a vertical slice passes all local TDD tests, the agent must merge it into `dev` using an explicit merge commit to simulate a clean PR history.
  - A final merge from `dev` to `main` will occur at the very end of the 3-hour constraint before pushing to the public remote repository.
- **Commit Messages**: Enforce conventional commits (e.g., `feat(backend): implement optimistic concurrency lock for bookings` or `test(e2e): add customer booking path smoke test`).

## 📂 Monorepo Architecture & Tech Stack
- **Structure**: Unified single-repository layout.
  - Backend: `./backend` (.NET 8 Web API Project)
  - Frontend: `./frontend` (React + Vite + TypeScript Project)
  - E2E Suite: `./e2e` (Playwright TypeScript Project)
- **Database**: Localized Microsoft SQL Server running via containerization.
- **Data Access**: Entity Framework Core. Use EF Core directly inside the vertical slices. **Banned Pattern**: Do not wrap EF Core in generic repositories or unit-of-work abstractions.
- **Initialization**: Apply schemas via EF migrations and automatically execute the `DbInitializer` seed script on first application run.

## 🎯 Backend Quality & C# Coding Standards
- **Vertical Slices Over Layers**: Group code strictly by business function inside `backend/Features/` (e.g., `Features/Appointments/BookAppointment/`), not by technical layers (Controllers/Services). Each feature slice must house its own Request parameters, Response DTOs, FluentValidation rules, MediatR Commands/Queries, and execution Handlers in the exact same directory.
- **API Versioning Contract**: All endpoints must be explicitly versioned using `Asp.Versioning`. The standard URL pattern is `api/v{version:apiVersion}/[feature]`. Default to version `1.0` for all initial slices.
- **Fail Fast & Robust Responses**: Intercept requests via a MediatR Pipeline Behavior to execute validations before hitting handlers. Unhandled exceptions must be caught by a global custom middleware mapping errors to clean RFC 7807 `ProblemDetails` formats.
- **Concurrency Guardrail**: Enforce database-level isolation or optimistic/pessimistic locking tokens within the booking slice routine to rigidly prevent double-booking identical slots.
- **Implicit vs Explicit Typing (`var`)**: 
  - Do NOT use `var` when the type is not explicitly clear from the right-hand side of the assignment (e.g., do use `var customer = new Customer();` or `var slots = await _db.Slots.ToListAsync();`). 
  - Do NOT use `var` for primitive types like `int`, `bool`, `string`, or when calling methods where the return type isn't obvious (e.g., use `string phone = GetMaskedPhone();`, not `var phone = GetMaskedPhone();`).
- **Asynchronous Execution**: Always append the `Async` suffix to asynchronous methods (e.g., `HandleAsync`). Never use `.Result` or `.Wait()`; always use `await`. Use `AsNoTracking()` for queries to maximize performance.
- **Roslyn CI Guardrails**: Code must adhere to strict static analysis. Ensure formatting rules match `.editorconfig`. The build must compile with clean logs, as the GitHub Actions CI pipeline treats all warnings as errors (`TreatWarningsAsErrors=true`).
- **C# Naming Conventions**:
PascalCase: All class names, records, interfaces (prefixed with a capital I), methods, public properties, namespaces, and enum values (e.g., BookAppointmentController, ISlotService, void HandleAsync(), public string CustomerName { get; }).
camelCase: Local variables, method parameters, and constructor parameters (e.g., customerName, dbContext).
_camelCase (prefixed with underscore): All private/protected fields (e.g., private readonly DbContext _dbContext;).
File Names: Class files must exactly match the primary class name they contain using PascalCase (e.g., BookAppointmentHandler.cs).

## 🎯 Backend Quality & C# Coding Standards
- **Vertical Slices Over Layers**: Group code strictly by business function inside `backend/Features/` (e.g., `Features/Appointments/BookAppointment/`), not by technical layers (Controllers/Services). Each feature slice must house its own Request parameters, Response DTOs, FluentValidation rules, MediatR Commands/Queries, and execution Handlers in the exact same directory.
- **API Versioning Contract**: All endpoints must be explicitly versioned using `Asp.Versioning`. The standard URL pattern is `api/v{version:apiVersion}/[feature]`. Default to version `1.0` for all initial slices.
- **Fail Fast & Robust Responses**: Intercept requests via a MediatR Pipeline Behavior to execute validations before hitting handlers. Unhandled exceptions must be caught by a global custom middleware mapping errors to clean RFC 7807 `ProblemDetails` formats.
- **Concurrency Guardrail**: Enforce database-level isolation or optimistic/pessimistic locking tokens within the booking slice routine to rigidly prevent double-booking identical slots.
- **Implicit vs Explicit Typing (`var`)**: 
  - Do NOT use `var` when the type is not explicitly clear from the right-hand side of the assignment (e.g., do use `var customer = new Customer();` or `var slots = await _db.Slots.ToListAsync();`). 
  - Do NOT use `var` for primitive types like `int`, `bool`, `string`, or when calling methods where the return type isn't obvious (e.g., use `string phone = GetMaskedPhone();`, not `var phone = GetMaskedPhone();`).
- **Asynchronous Execution**: Always append the `Async` suffix to asynchronous methods (e.g., `HandleAsync`). Never use `.Result` or `.Wait()`; always use `await`. Use `AsNoTracking()` for queries to maximize performance.
- **Roslyn CI Guardrails**: Code must adhere to strict static analysis. Ensure formatting rules match `.editorconfig`. The build must compile with clean logs, as the GitHub Actions CI pipeline treats all warnings as errors (`TreatWarningsAsErrors=true`).

## 🧪 Specification & Testing Rules
- **Cucumber User Stories**: At the conclusion of Phase 2 (Brainstorming), the specification module MUST compile a set of functional acceptance criteria written as **Cucumber/Gherkin User Stories`** using standard `Given/When/Then` syntax.
- **Test Target Boundaries**: Gherkin features serve as the contract. Prioritize integration tests using `.NET`'s `WebApplicationFactory` to spin up the API and test feature boundaries end-to-end.
- **Playwright E2E Execution**: Focus E2E tests strictly on critical user paths (e.g., booking slots, switching mechanic contexts). Avoid cosmetic layout assertions. Use Playwright's local development server configuration to auto-boot the frontend/backend services before execution.
- **Assertions**: Write C# backend assertions using `FluentAssertions`. Write Playwright assertions using strict async web locators (e.g., `await expect(page.locator(...)).toBeVisible()`).

## 🎨 Frontend Quality & TypeScript/React Coding Standards
- **TypeScript Strictness**: Set `"strict": true` in `tsconfig.json`. Do not use `any`. Explicitly declare `interface` or `type` definitions for all component props and backend API contracts.
- **Component Style**: Write components as standard named functional components, not anonymous arrow functions (e.g., use `export function SlotGrid() {}`, do NOT use `const SlotGrid = () => {}`). This ensures consistent formatting and clean stack traces.
- **Frontend Code Linting & Formatting**:
  - **Linting Rules**: Strictly enforce ESLint using the `@typescript-eslint/eslint-plugin` and `eslint-plugin-react-hooks` suites.
  - **No Unused Variables**: Code must compile without unused variables or imports (`@typescript-eslint/no-unused-vars`: "error").
  - **React Hook Dependencies**: Exhaustive dependency checks must be active for all React Hooks (`react-hooks/exhaustive-deps`: "error").
- **Data Fetching & State Engine**: Keep state management lightweight. Use async/await explicitly within native React hooks (`useState`, `useEffect`) or clean data-fetching utilities (like Axios/React Query). Handle loading and explicit error feedback states on every API call. Do not introduce heavy state engines like Redux.
- **Theme & Aesthetic**: Replicate an "AA Motoring" brand vibe using flat utility-first Tailwind CSS. Use deep slate panels (`bg-zinc-900`), crisp white workspaces, and highly prominent bright amber accents (`bg-amber-400` / `hover:bg-amber-500`) for main action hooks.
- **Layout Grid**: Use a clean, highly scannable 7-column calendar grid layout to display the upcoming 7 days of available booking slots.
- **Web Accessibility (a11y) Standards**:
  - **Semantic HTML**: Explicitly use `<button>` tags for actions, `<a>` tags for navigation links, and structured landmarks (`<header>`, `<main>`, `<nav>`, `<section>`).
  - **Color Contrast**: All text overlaid on the brand primary background (`bg-amber-400`) must strictly use high-contrast dark text (`text-zinc-950`).
  - **Form Guardrails**: Every input element must be explicitly bound to an accessible text label using the `htmlFor` attribute.
  - **Keyboard Focus States**: Every interactive control must feature visible focus rings (e.g., `focus:outline-none focus:ring-2 focus:ring-amber-400`).
  - **Screen Reader Context**: Use Tailwind's hidden utility class (`<span className="sr-only">Completed</span>`) to provide screen-reader text for non-text indicators.

## ⚠️ Constraint Boundary (Strictly Out of Scope)
- Do not build actual Authentication or Registration flows. Simulate user interaction by building a global identity dropdown header ("Act As: Admin", "Act As: Mechanic Dave").
- Leave notifications (SMS/Email), cancellations, rescheduling loops, payments, or mobile responsive styling explicitly out of scope. Note them as "Future Enhancements" in the README if encountered.

## 🚀 Monorepo CLI Commands

### Database Infrastructure
- Start SQL Server: `docker-compose up -d`

### Backend Operations
- Navigate: `cd backend`
- Build Solution: `dotnet build`
- Run API Service: `dotnet run`
- Execute Tests: `dotnet test`
- Apply New Data Migration: `dotnet ef migrations add <MigrationName>`
- Run Roslyn Formatter: `dotnet format`
- Verify Format Only: `dotnet format --verify-no-changes`

### Frontend Operations
- Navigate: `cd frontend`
- Initialize Dependencies: `npm install`
- Launch Dev Server: `npm run dev`
- Run Frontend Linter: `npm run lint`
- Auto-Fix Linting Violations: `npm run lint -- --fix`

### End-to-End Testing Operations
- Navigate: `cd e2e`
- Install Playwright Browsers: `npx playwright install`
- Run Playwright E2E Tests: `npx playwright test`
- Open Playwright UI Dashboard: `npx playwright test --ui`

### Production Readiness Check (Run at minute 165)
- Scan Codebase for AI Slop / Structural Health: `npx @hypership-software/vibe-check scan .`