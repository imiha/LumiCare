# CLAUDE.md — Clinique Lumière

This file is the shared way of work between the team and Claude.
Both humans and Claude read it at the start of every session.

@.claude/skills/feature-delivery/SKILL.md
@.claude/skills/github-workflow/SKILL.md

---

## 1. Roles — Who are we?

| Hat | Who | Responsibility |
|---|---|---|
| **PO** | Human | Defines and approves stories in PRD.md; reviews output against acceptance criteria; does not write code |
| **Devs** | Human(s) | Build features alongside Claude; own code quality and PR sign-off |
| **Claude** | AI builder | Implements from approved stories; proposes, never decides scope; asks before assuming |

**Rule:** Claude does not start a story until the PO has signed off its acceptance criteria.

---

## 2. Scope — What are we building?

**The one problem first:** Receptionists lose time on manual intake and risk double-bookings. We fix that.

**In scope (sprint 1):**
- Patient Intake — registration, medical history, search
- Appointments — scheduling, time slots, conflict detection
- Staff Dashboard — daily schedules per practitioner, alerts

**Out of scope:**
- Treatments catalog, Wellness Programs, Billing
- Authentication / access control
- Email or SMS notifications
- Mobile responsiveness (desktop-first)

**Done = ?** A story is done when:
1. The UI matches the acceptance criteria in `PRD.md`
2. The backend persists data and returns correct responses
3. `ng build` passes with no TypeScript errors

---

## 3. Way of Working — How will we work?

```
PO approves story
  → devs + Claude build
    → PO reviews in browser
      → done or iterate
        → next story
```

- **One story at a time** — next story starts only after the current one is reviewed
- **PRD.md is source of truth** — if code and PRD disagree, fix the code
- **No gold-plating** — Claude builds exactly what the story says, nothing more
- **Ask before assuming** — if acceptance criteria is ambiguous, Claude asks before writing code
- **Hand-off triggers:** story complete · question blocks progress · scope decision needed

---

## 4. Stack & Tools — What with?

| Layer | Technology |
|---|---|
| Frontend | Angular 18 — standalone components, signals (`signal`, `computed`, `effect`), SCSS |
| Backend | Node.js + Express 4 — REST API on port 3000 |
| Database | SQLite via `sql.js` (pure JS — no native build tools required) |
| Language | TypeScript strict mode throughout |

**Dev commands:**
- `ng serve` → `http://localhost:4200`
- `node backend/server.js` → `http://localhost:3000`

**Key constraints:**
- Standalone components only — no `NgModule`
- State via Angular signals, not RxJS `BehaviorSubject`
- `HttpClient` configured via `provideHttpClient()` in `app.config.ts`
- Every SQLite write must call `save()` to persist to disk

Claude reaches the codebase at `C:\LikeAHuman\LumiCare\`.

---

## 5. Artifacts & Standards — What do we write down?

| Artifact | Location | Owner | Purpose |
|---|---|---|---|
| PRD | [`PRD.md`](PRD.md) | PO | Epics, features, stories, acceptance criteria |
| CLAUDE.md | [`CLAUDE.md`](CLAUDE.md) | Team | Shared working agreement — read every session |
| ADRs | [`docs/adr/`](docs/adr/README.md) | Devs | Short records of key architecture decisions |
| Coding standards | [`.coding-standards/README.md`](.coding-standards/README.md) | Devs | TypeScript, Angular, Express rules and pre-commit checklist |
| Changelog | [`CHANGELOG.md`](CHANGELOG.md) | Devs + Claude | One line per completed story: what changed and why |

**How to use these artifacts:**
- Before starting a story: re-read the relevant section of `PRD.md` and check `docs/adr/` for any decisions that affect the feature
- Before committing: run the pre-commit checklist in `.coding-standards/README.md`
- After a decision with long-term impact: add an ADR using the template at `docs/adr/ADR-000-template.md`
- After completing a story: add one line to `CHANGELOG.md`

**Naming conventions (summary — full rules in `.coding-standards/README.md`):**
- Files: `kebab-case.component.ts`, `kebab-case.service.ts`
- Components: `PascalCase` class names, `app-*` selector prefix
- Signals: named after what they hold — `patients`, `loading`, `selectedPatient`
- API errors: always `{ error: "human-readable message" }`

---

## 6. Repo — How do we share one repo?

- Everyone (devs + Claude) is a collaborator
- **Branch per story:** `story/<id>-short-description`
  - Example: `story/1.1.1-registration-form`
- **PR required** before merge to `main`; PO or another dev reviews
- `main` is always deployable — no broken builds merged
- **Commit style:** imperative present tense — `add patient registration form`
