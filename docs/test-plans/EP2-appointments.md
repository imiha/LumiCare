# Test Plan — EP2 Appointments

**Epic:** 2 — Appointments  
**Stories covered:** 2.1.1 · 2.1.2 · 2.1.3 · 2.2.1 · 2.2.2 · 2.2.3  
**Reviewer role:** PO (manual browser testing)

---

## Prerequisites

1. Backend running: `node backend/server.js` → confirm `http://localhost:3000/api/health` returns `{"status":"ok"}`
2. Frontend running: `ng serve` → open `http://localhost:4200`
3. Navigate to **Appointments** via the top nav
4. Today's date should show 3 seeded appointments in the list

---

## Feature 2.2 — Appointment List & Filters

### TC-2.2.1-A · Seeded appointments visible on first load

| | |
|---|---|
| **Story** | 2.2.1 |
| **Steps** | 1. Open the Appointments page |
| **Expected** | List shows 3 rows for today with patients Marie Dupont, Jean Martin, Sophie Bernard |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.2.1-B · Table columns present

| | |
|---|---|
| **Story** | 2.2.1 |
| **Steps** | 1. Observe the appointments table header |
| **Expected** | Columns include: Time, Patient, Practitioner, Service, Status |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.2.1-C · Status badges — correct colours

| | |
|---|---|
| **Story** | 2.2.1 |
| **Steps** | 1. Observe the Status column for the seeded appointments |
| **Expected** | "scheduled" badge is blue; "confirmed" badge is green |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.2.2-A · Date filter — defaults to today

| | |
|---|---|
| **Story** | 2.2.2 |
| **Steps** | 1. Open the Appointments page · 2. Observe the date picker value |
| **Expected** | Date picker shows today's date; list shows today's appointments |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.2.2-B · Date filter — changing date reloads list

| | |
|---|---|
| **Story** | 2.2.2 |
| **Steps** | 1. Change the date picker to yesterday |
| **Expected** | List reloads within 500 ms and shows "No appointments for this date." (no seeded data for yesterday) |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.2.2-C · Date filter — return to today restores seeded data

| | |
|---|---|
| **Story** | 2.2.2 |
| **Steps** | 1. Continue from TC-2.2.2-B · 2. Change the date picker back to today |
| **Expected** | The 3 seeded appointments are visible again |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.2.3-A · Cancel appointment — badge updates immediately

| | |
|---|---|
| **Story** | 2.2.3 |
| **Steps** | 1. Click **Cancel** on the first seeded appointment |
| **Expected** | Status badge changes to "cancelled" (red) immediately; no page reload |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.2.3-B · Cancel appointment — Cancel button hidden after cancellation

| | |
|---|---|
| **Story** | 2.2.3 |
| **Steps** | Continue from TC-2.2.3-A |
| **Expected** | The Cancel button is no longer visible on the cancelled row |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.2.3-C · Cancel persists after reload

| | |
|---|---|
| **Story** | 2.2.3 |
| **Steps** | 1. Cancel an appointment · 2. Reload the page |
| **Expected** | The appointment still shows status "cancelled" |
| **Result** | ☐ Pass ☐ Fail |

---

## Feature 2.1 — Appointment Booking

### TC-2.1.1-A · Form disabled until patient is selected

| | |
|---|---|
| **Story** | 2.1.1 |
| **Steps** | 1. Observe the booking form on the left · 2. Try to interact with the Practitioner dropdown or Date field |
| **Expected** | Practitioner, Service, Date, Start Time, End Time fields are all disabled / greyed out |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.1.1-B · Patient autocomplete — search shows results

| | |
|---|---|
| **Story** | 2.1.1 |
| **Steps** | 1. Type `mar` in the Patient search box |
| **Expected** | A dropdown appears listing patients whose name contains "mar" (e.g. Jean Martin, Marie Dupont) |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.1.1-C · Patient autocomplete — selecting a patient enables the form

| | |
|---|---|
| **Story** | 2.1.1 |
| **Steps** | 1. Type `mar` · 2. Click "Marie Dupont" in the dropdown |
| **Expected** | Dropdown closes; patient name shown as selected tag; Practitioner, Service, Date, Start Time fields become enabled |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.1.1-D · End time auto-calculated from service duration

| | |
|---|---|
| **Story** | 2.1.1 |
| **Steps** | 1. Select Marie Dupont · 2. Choose any Practitioner · 3. Choose "Initial Consultation" (60 min) · 4. Set Start time to `10:00` |
| **Expected** | End time is automatically set to `11:00` |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.1.1-E · End time updates when service changes

| | |
|---|---|
| **Story** | 2.1.1 |
| **Steps** | 1. Continue from TC-2.1.1-D (Start time 10:00, service "Initial Consultation" → End 11:00) · 2. Change service to "Follow-up" (30 min) |
| **Expected** | End time updates to `10:30` |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.1.1-F · Submit button disabled when required fields are missing

| | |
|---|---|
| **Story** | 2.1.1 |
| **Steps** | 1. Select a patient but leave Practitioner empty |
| **Expected** | Book Appointment button is disabled |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.1.2-A · Conflict detection — inline error for overlapping booking

| | |
|---|---|
| **Story** | 2.1.2 |
| **Pre-condition** | Seeded appointment: Marie Dupont with Dr. Sophie Laurent, Initial Consultation, today 09:00–10:00 |
| **Steps** | 1. Select any patient · 2. Select **Dr. Sophie Laurent** · 3. Select any service · 4. Set today's date · 5. Set Start time `09:00`, End time `09:30` · 6. Click Book Appointment |
| **Expected** | Inline error appears: "Time slot conflict: Dr. Sophie Laurent is already booked from 09:00 to 10:00"; form stays open |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.1.2-B · Conflict error clears when corrected and resubmitted

| | |
|---|---|
| **Story** | 2.1.2 |
| **Steps** | 1. Trigger the conflict error (TC-2.1.2-A) · 2. Change the start time to `11:00` and end time to `12:00` · 3. Submit again |
| **Expected** | Conflict error disappears; appointment is booked successfully |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.1.3-A · New appointment appears in list without reload

| | |
|---|---|
| **Story** | 2.1.3 |
| **Steps** | 1. Book a valid appointment for today · 2. Observe the appointment list on the right |
| **Expected** | New appointment row appears immediately in the list, sorted by start time; no page reload |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.1.3-B · Success banner shown for 3 seconds

| | |
|---|---|
| **Story** | 2.1.3 |
| **Steps** | 1. Book a valid appointment for today |
| **Expected** | A green "Appointment booked successfully" banner appears below the form; it disappears automatically after ~3 seconds |
| **Result** | ☐ Pass ☐ Fail |

### TC-2.1.3-C · Form resets after successful booking

| | |
|---|---|
| **Story** | 2.1.3 |
| **Steps** | Continue from TC-2.1.3-A |
| **Expected** | Patient search field is cleared; all form fields are empty / disabled again |
| **Result** | ☐ Pass ☐ Fail |

---

## Regression

After all cases above pass, run these quick smoke checks:

| Check | Expected | Result |
|---|---|---|
| Navigate to Patients and back to Appointments | List still shows today's appointments | ☐ Pass ☐ Fail |
| Book appointment for a future date, then filter to that date | New appointment is visible | ☐ Pass ☐ Fail |
| Cancel an appointment, then book a new one in the same slot | Booking succeeds (cancelled slot is free) | ☐ Pass ☐ Fail |
| Reload the page | All data (new bookings + cancellations) persists | ☐ Pass ☐ Fail |
