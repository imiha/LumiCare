# GitHub Issues — How Stories Were Created

This document describes the structure and process used to create all epics, features, and stories as GitHub issues on [imiha/LumiCare](https://github.com/imiha/LumiCare/issues).

---

## 1. Label Strategy

Labels are the backbone of the hierarchy. Three groups of labels were created before any issue:

### Epic labels (dark blue)
Used to mark which epic an issue belongs to.

| Label | Colour | Description |
|---|---|---|
| `epic-1-patient-intake` | `#0052CC` | Epic 1: Patient Intake |
| `epic-2-appointments` | `#0075CA` | Epic 2: Appointments |
| `epic-3-staff-dashboard` | `#005C99` | Epic 3: Staff Dashboard |

### Feature labels (yellow / gold / light blue)
Used to mark which feature within an epic an issue belongs to.

| Label | Colour | Description |
|---|---|---|
| `feature-1.1-registration` | `#E4E669` | Feature 1.1: Patient Registration |
| `feature-1.2-medical-history` | `#E4E669` | Feature 1.2: Medical History |
| `feature-1.3-search-list` | `#E4E669` | Feature 1.3: Patient Search & List |
| `feature-2.1-booking` | `#FBCA04` | Feature 2.1: Appointment Booking |
| `feature-2.2-list-filters` | `#FBCA04` | Feature 2.2: Appointment List & Filters |
| `feature-3.1-daily-schedule` | `#BFD4F2` | Feature 3.1: Daily Schedule View |
| `feature-3.2-alerts` | `#BFD4F2` | Feature 3.2: Alerts |

### Type label (green)
| Label | Colour | Description |
|---|---|---|
| `story` | `#C2E0C6` | User story |

Labels were created with:
```powershell
$gh = "C:\Program Files\GitHub CLI\gh.exe"
& $gh label create "epic-1-patient-intake" --repo imiha/LumiCare --color "0052CC" --description "Epic 1: Patient Intake"
```

---

## 2. Issue Structure

Two types of issues were created: **story issues** and **epic tracker issues**.

### Story issues (one per story)

Each story is a standalone issue with:
- **Title:** `[X.Y.Z] Story Name` — the story ID prefix makes issues easy to scan and sort
- **Labels:** `story` + the parent epic label + the parent feature label
- **Body:** structured with three sections:
  1. **User Story** — the as-a / I-want / so-that sentence from the PRD
  2. **Fields / Columns / Details** — any specifics (form fields, table columns, etc.)
  3. **Acceptance Criteria** — each criterion as a GitHub task checkbox (`- [ ]`)

Example body template:
```markdown
## User Story
**As a** [role],
**I want** [action],
**so that** [outcome].

## Fields
- Field A
- Field B

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

Story issues were created with:
```powershell
& $gh issue create --repo imiha/LumiCare `
  --title "[1.1.1] Registration Form" `
  --label "story,epic-1-patient-intake,feature-1.1-registration" `
  --body @'
## User Story
...
## Acceptance Criteria
- [ ] ...
'@
```

### Epic tracker issues (one per epic)

Each epic has a single tracker issue that:
- **Title:** `[EPIC N] Epic Name`
- **Label:** the epic label only (no `story`, no feature label)
- **Body:** lists all stories grouped by feature as GitHub task checkboxes, referencing each story issue by its auto-assigned number (`#N`)

This gives a progress view at a glance — GitHub automatically shows `X / Y` completion on the epic issue as story checkboxes are ticked.

Example:
```markdown
## Epic 1 — Patient Intake

### Feature 1.1 — Patient Registration
- [ ] #1 [1.1.1] Registration Form
- [ ] #2 [1.1.2] Duplicate Email Detection
- [ ] #3 [1.1.3] Registration Success State
```

---

## 3. Issue Map

| Issue | ID | Type | Epic label | Feature label |
|---|---|---|---|---|
| #1  | 1.1.1 | story | epic-1 | feature-1.1 |
| #2  | 1.1.2 | story | epic-1 | feature-1.1 |
| #3  | 1.1.3 | story | epic-1 | feature-1.1 |
| #4  | 1.2.1 | story | epic-1 | feature-1.2 |
| #5  | 1.2.2 | story | epic-1 | feature-1.2 |
| #6  | 1.3.1 | story | epic-1 | feature-1.3 |
| #7  | 1.3.2 | story | epic-1 | feature-1.3 |
| #8  | 2.1.1 | story | epic-2 | feature-2.1 |
| #9  | 2.1.2 | story | epic-2 | feature-2.1 |
| #10 | 2.1.3 | story | epic-2 | feature-2.1 |
| #11 | 2.2.1 | story | epic-2 | feature-2.2 |
| #12 | 2.2.2 | story | epic-2 | feature-2.2 |
| #13 | 2.2.3 | story | epic-2 | feature-2.2 |
| #14 | 3.1.1 | story | epic-3 | feature-3.1 |
| #15 | 3.1.2 | story | epic-3 | feature-3.1 |
| #16 | 3.1.3 | story | epic-3 | feature-3.1 |
| #17 | 3.2.1 | story | epic-3 | feature-3.2 |
| #18 | 3.2.2 | story | epic-3 | feature-3.2 |
| #19 | — | epic tracker | epic-1 | — |
| #20 | — | epic tracker | epic-2 | — |
| #21 | — | epic tracker | epic-3 | — |

---

## 4. Tooling

All issues were created via the **GitHub CLI** (`gh`), installed at:
```
C:\Program Files\GitHub CLI\gh.exe
```

Authentication: logged in as `imiha` with `repo` scope via keyring.

```powershell
$gh = "C:\Program Files\GitHub CLI\gh.exe"
& $gh auth status
& $gh label create ...
& $gh issue create ...
```

No GitHub web UI was used. Everything was scripted in PowerShell.

---

## 5. Conventions to Reuse

| Convention | Reason |
|---|---|
| `[X.Y.Z]` prefix in issue title | Keeps issues sorted and traceable back to the PRD |
| Three labels per story (type + epic + feature) | Enables filtering by any level of the hierarchy |
| Acceptance criteria as `- [ ]` checkboxes | GitHub renders them as a progress bar on the issue |
| Epic tracker issue with `#N` references | GitHub auto-links and shows checklist completion % |
| Stories created before epics | Epic tracker references story issue numbers, which are only known after creation |
