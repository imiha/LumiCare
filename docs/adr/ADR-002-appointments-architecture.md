# ADR-002 — Appointments feature — conflict detection, cancel update, and date-scoped loading

**Date:** 2026-06-09  
**Status:** Accepted  
**Deciders:** PO, Dev team

---

## Context

Epic 2 introduces appointment booking with three non-trivial design questions:

1. **Conflict detection** — how to prevent a practitioner being double-booked.
2. **Cancel feedback** — whether to re-fetch the list or update state in place after a cancellation.
3. **List scope** — whether to load all appointments or only those for the selected date.

## Decision

### 1. Conflict detection via HTTP 409

The backend checks for overlapping appointments (same practitioner, same date, non-cancelled status, overlapping `start_time`/`end_time`) inside the `POST /api/appointments` handler and returns **409 Conflict** with a human-readable body:

```
{ "error": "Time slot conflict: Dr. Laurent is already booked from 09:00 to 10:00" }
```

The frontend `AppointmentFormComponent` catches the 409, reads `err.error.error`, and sets a `conflictError` signal rendered inline beneath the form fields.

### 2. Optimistic signal update on cancel

After `PATCH /api/appointments/:id/cancel` succeeds, `AppointmentListComponent` emits `appointmentCancelled(id)` to the parent container. The container (`AppointmentsComponent`) updates its `appointments` signal in place — mapping the matching entry to `{ ...appt, status: 'cancelled' }` — rather than re-fetching the full list.

### 3. Date-scoped list loading

`GET /api/appointments?date=YYYY-MM-DD` returns only appointments for a single date. The frontend defaults to today on load and reloads when the date filter changes.

## Alternatives considered

| Option | Reason rejected |
|---|---|
| Pre-flight availability check (separate GET before POST) | Two round-trips, race condition between check and write |
| Return available slots from the API instead of rejecting | More complex API surface; not required by the PRD |
| Re-fetch full list after cancel | Unnecessary network round-trip; the cancelled status is already known from the PATCH response |
| Load all appointments, filter client-side | Unbounded result set as data grows; date filter is the primary access pattern |
| Separate `/api/appointments/check-conflict` endpoint | Duplicates conflict logic; 409 on the write endpoint is standard REST practice |

## Consequences

**Positive:** Conflict detection is atomic (no race window); cancel feedback is instant with no flicker from a reload; date-scoped queries stay fast regardless of total appointment volume.  
**Negative / trade-offs:** If the backend is restarted between a cancel and a page refresh, the local signal is the only source of truth until the next reload — acceptable for a single-session receptionist workflow.  
**Risks:** The optimistic update means the UI shows `cancelled` even if the PATCH call silently fails after the response. Mitigated by the error handler resetting `cancelling` to `null` and leaving the status unchanged on network failure.
