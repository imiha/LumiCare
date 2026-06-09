# Test Plan — EP1 Patient Intake

**Epic:** 1 — Patient Intake  
**Stories covered:** 1.1.1 · 1.1.2 · 1.1.3 · 1.2.1 · 1.2.2 · 1.3.1 · 1.3.2  
**Reviewer role:** PO (manual browser testing)

---

## Prerequisites

1. Backend running: `node backend/server.js` → confirm `http://localhost:3000/api/health` returns `{"status":"ok"}`
2. Frontend running: `ng serve` → open `http://localhost:4200`
3. App auto-redirects to `/patients` — the patient list should be visible with 3 seeded patients

---

## Feature 1.3 — Patient List

### TC-1.3.1-A · Seeded patients visible on first load

| | |
|---|---|
| **Story** | 1.3.1 |
| **Steps** | 1. Open `http://localhost:4200/patients` |
| **Expected** | Table shows 3 rows: Marie Dupont, Jean Martin, Sophie Bernard |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.3.1-B · Table columns present

| | |
|---|---|
| **Story** | 1.3.1 |
| **Steps** | 1. Observe the patient table header |
| **Expected** | Columns: Name, Email, Phone (at minimum) |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.3.2-A · Live search — fewer than 2 characters

| | |
|---|---|
| **Story** | 1.3.2 |
| **Steps** | 1. Type `m` in the search box |
| **Expected** | All 3 patients still visible (no filter applied below 2 chars) |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.3.2-B · Live search — filters by last name

| | |
|---|---|
| **Story** | 1.3.2 |
| **Steps** | 1. Type `du` in the search box |
| **Expected** | Only Marie Dupont is shown |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.3.2-C · Live search — filters by email

| | |
|---|---|
| **Story** | 1.3.2 |
| **Steps** | 1. Type `jean@` in the search box |
| **Expected** | Only Jean Martin is shown |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.3.2-D · Live search — clear restores full list

| | |
|---|---|
| **Story** | 1.3.2 |
| **Steps** | 1. Type `du` · 2. Clear the search box |
| **Expected** | All 3 patients are visible again |
| **Result** | ☐ Pass ☐ Fail |

---

## Feature 1.1 — Patient Registration

### TC-1.1.1-A · Required field validation — empty submit

| | |
|---|---|
| **Story** | 1.1.1 |
| **Steps** | 1. Click the Register / New Patient button · 2. Leave all fields blank · 3. Observe the Submit button |
| **Expected** | Submit button is disabled; form cannot be submitted |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.1.1-B · Required field validation — missing first name

| | |
|---|---|
| **Story** | 1.1.1 |
| **Steps** | 1. Fill Last name and Email · 2. Leave First name blank |
| **Expected** | Submit button remains disabled |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.1.1-C · Required field validation — invalid email format

| | |
|---|---|
| **Story** | 1.1.1 |
| **Steps** | 1. Fill First name, Last name · 2. Type `notanemail` in the Email field |
| **Expected** | Submit button is disabled |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.1.1-D · Submit enabled when all required fields are valid

| | |
|---|---|
| **Story** | 1.1.1 |
| **Steps** | 1. Fill First name: `Test` · Last name: `User` · Email: `test@example.com` |
| **Expected** | Submit button becomes enabled |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.1.2-A · Duplicate email — inline error shown

| | |
|---|---|
| **Story** | 1.1.2 |
| **Pre-condition** | marie.dupont@example.com is already seeded |
| **Steps** | 1. Fill First name: `Another` · Last name: `Dupont` · Email: `marie.dupont@example.com` · 2. Submit |
| **Expected** | Inline error "A patient with this email already exists" appears below the email field; no page reload |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.1.2-B · Duplicate error clears on next valid submission

| | |
|---|---|
| **Story** | 1.1.2 |
| **Steps** | 1. Trigger the duplicate error (TC-1.1.2-A) · 2. Change the email to a unique address · 3. Submit |
| **Expected** | Error disappears; submission succeeds |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.1.3-A · Successful registration — form clears

| | |
|---|---|
| **Story** | 1.1.3 |
| **Steps** | 1. Fill First name: `Nouveau` · Last name: `Patient` · Email: `nouveau@example.com` · 2. Submit |
| **Expected** | Form fields are empty after submission; no page reload |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.1.3-B · Successful registration — patient appears in list

| | |
|---|---|
| **Story** | 1.1.3 |
| **Steps** | Continue from TC-1.1.3-A |
| **Expected** | "Nouveau Patient" appears in the patient list immediately (no page reload needed) |
| **Result** | ☐ Pass ☐ Fail |

---

## Feature 1.2 — Medical History

### TC-1.2.1-A · Medical history section — collapsible

| | |
|---|---|
| **Story** | 1.2.1 |
| **Steps** | 1. Click on any patient row to open the detail panel · 2. Find the Medical History section header · 3. Click it to collapse |
| **Expected** | Medical history fields (allergies, medications, conditions, notes) are hidden |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.2.1-B · Medical history section — expandable

| | |
|---|---|
| **Story** | 1.2.1 |
| **Steps** | Continue from TC-1.2.1-A · 1. Click the section header again |
| **Expected** | Medical history fields are visible again |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.2.1-C · Medical history fields are optional

| | |
|---|---|
| **Story** | 1.2.1 |
| **Steps** | 1. Open a patient with no medical history filled in · 2. Click Save without filling any history fields |
| **Expected** | Save succeeds without errors |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.2.2-A · Patient detail panel — opens on row click

| | |
|---|---|
| **Story** | 1.2.2 |
| **Steps** | 1. Click the row for Marie Dupont |
| **Expected** | Detail panel opens showing "Marie Dupont" in the header |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.2.2-B · Patient detail panel — fields pre-populated

| | |
|---|---|
| **Story** | 1.2.2 |
| **Steps** | 1. Click the row for Marie Dupont |
| **Expected** | First name, Last name, Email fields are pre-filled with her data; allergy "Penicillin" and condition "Hypertension" are visible in the history section |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.2.2-C · Patient detail — edits persist after reload

| | |
|---|---|
| **Story** | 1.2.2 |
| **Steps** | 1. Click Marie Dupont · 2. Change her phone number · 3. Click Save · 4. Reload the page · 5. Click Marie Dupont again |
| **Expected** | The new phone number is visible in the detail panel |
| **Result** | ☐ Pass ☐ Fail |

### TC-1.2.2-D · Save — success feedback

| | |
|---|---|
| **Story** | 1.2.2 |
| **Steps** | 1. Open any patient · 2. Change a field · 3. Click Save |
| **Expected** | A success indicator appears (e.g. "Saved" message); it disappears after ~3 seconds |
| **Result** | ☐ Pass ☐ Fail |

---

## Regression

After all cases above pass, run these quick smoke checks:

| Check | Expected | Result |
|---|---|---|
| Navigate away to Appointments and back to Patients | Patient list still shows all patients | ☐ Pass ☐ Fail |
| Reload the page | Seeded + any newly registered patients still present | ☐ Pass ☐ Fail |
| Search then register a new patient | New patient appears and search still works | ☐ Pass ☐ Fail |
