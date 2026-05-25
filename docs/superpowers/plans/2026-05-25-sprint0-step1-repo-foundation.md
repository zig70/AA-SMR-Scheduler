# Sprint 0 — Step 1: Repo Foundation & Database Infrastructure

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Patch the existing `.gitignore` with missing frontend/E2E output patterns, establish a cross-IDE `.editorconfig` aligned to Roslyn and TypeScript standards, and spin up a containerised SQL Server 2022 instance via Docker Compose.

**Architecture:** A single `docker-compose.yml` at the repo root manages the SQL Server container. The SA password is injected from a gitignored `.env` file; a safe `.env.example` template is committed. The `.editorconfig` is the single authoritative formatter config consumed by both `dotnet format` and the VS Code / Rider IDE extensions.

**Tech Stack:** Docker Compose, SQL Server 2022 (`mcr.microsoft.com/mssql/server:2022-latest`), `.editorconfig`, `.gitignore`

---

## File Map

| File | Status | Action |
|---|---|---|
| `.gitignore` | Exists | Append 4 missing lines |
| `.editorconfig` | **Missing** | Create |
| `docker-compose.yml` | **Missing** | Create |
| `.env.example` | **Missing** | Create |
| `.env` | Gitignored | Create locally only — never commit |

---

### Task 1: Extend `.gitignore` with Frontend & E2E Patterns

**Files:**
- Modify: `.gitignore`

---

- [x] **Step 1: Append the missing patterns to the bottom of `.gitignore`**

The existing file covers `.env`, `node_modules/`, and `test-results/` (generic). These four lines are absent:

```
# Frontend build output
dist/
.vite/

# Playwright artefacts
playwright-report/
```

- [x] **Step 2: Verify only the expected lines are added**

Run: `git diff .gitignore`
Expected: Exactly those 4 content lines appear as additions. No other lines changed.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: extend .gitignore with frontend dist and playwright report patterns"
```

---

### Task 2: Create `.editorconfig`

**Files:**
- Create: `.editorconfig`

---

- [x] **Step 1: Create `.editorconfig` at the repo root**

Rules must satisfy three constraints from `CLAUDE.md`:
1. C# indent = 4, sorted usings, braces always, Roslyn `dotnet format` happy
2. TypeScript / JSON / YAML indent = 2
3. CRLF line endings (Windows repo) with UTF-8 charset

```ini
root = true

[*]
charset = utf-8
end_of_line = crlf
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.cs]
indent_size = 4
dotnet_sort_system_directives_first = true
dotnet_separate_import_directive_groups = false
csharp_new_line_before_open_brace = all
csharp_indent_case_contents = true
csharp_indent_switch_labels = true
csharp_prefer_braces = true:warning
dotnet_style_qualification_for_field = false:suggestion
dotnet_style_qualification_for_property = false:suggestion

[*.{ts,tsx,js,jsx}]
indent_size = 2

[*.json]
indent_size = 2

[*.yml]
indent_size = 2

[Makefile]
indent_style = tab
```

- [x] **Step 2: Verify the file is on disk and parseable**

Run: `Get-Content .editorconfig`
Expected: File content is printed with no errors.

Note: Full `dotnet format --verify-no-changes` validation runs in the backend scaffold step once a `.csproj` exists. This step just confirms the file is present and syntactically valid.

- [ ] **Step 3: Commit**

```bash
git add .editorconfig
git commit -m "chore: add .editorconfig for Roslyn and TypeScript format consistency"
```

---

### Task 3: Docker Compose — SQL Server 2022

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`

---

- [x] **Step 1: Create `.env.example`** (safe template — this IS committed)

- [x] **Step 2: Create `.env` locally from the template** (never committed — already in `.gitignore`)

Run:
```powershell
Copy-Item .env.example .env
```

Then open `.env` and set a real local password:
```
MSSQL_SA_PASSWORD=Dev_Local_P@ss1!
```

- [x] **Step 3: Create `docker-compose.yml`**

Health-check flag notes:
- `-b` — exit non-zero on SQL error (makes Docker treat it as unhealthy)
- `-No` — suppress output header rows
- `-C` — trust the server certificate (required for `mssql-tools18` against SQL Server 2022)
- `$$MSSQL_SA_PASSWORD` — double-dollar is Docker Compose's escape for a literal `$` inside the shell string

- [ ] **Step 4: Start the container**

Run: `docker-compose up -d`
Expected output: `Container smr_sqlserver  Started`

- [ ] **Step 5: Poll until the health check reports healthy**

Run (repeat every ~10s until output changes from `starting`):
```powershell
docker inspect smr_sqlserver --format "{{.State.Health.Status}}"
```
Expected: `healthy` (typically within 30–60 s on first image pull)

- [ ] **Step 6: Smoke-test connectivity**

Run:
```powershell
docker exec smr_sqlserver /opt/mssql-tools18/bin/sqlcmd `
  -S localhost -U SA -P "Dev_Local_P@ss1!" `
  -Q "SELECT @@VERSION" -No -C
```
Expected: A string beginning with `Microsoft SQL Server 2022` printed to stdout.

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml .env.example
git commit -m "infra: add docker-compose for SQL Server 2022 with named volume and health check"
```

---

**Step 1 complete.** At this point the repo has consistent formatting rules, no stray artefact files will ever slip into git, and any developer can run `docker-compose up -d` to get a ready SQL Server instance in under 60 seconds.
