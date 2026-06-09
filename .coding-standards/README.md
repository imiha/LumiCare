# Coding Standards — Clinique Lumière

Stack: **Angular 18 · Node.js + Express 4 · TypeScript strict · SQLite (sql.js)**

These rules apply to all code in this repository. They are the project-specific refinement of the global coding standards.

---

## 1. TypeScript

- `strict: true` in every `tsconfig` — no exceptions
- Prefer `type` aliases for unions/intersections; use `interface` for object shapes that will be extended
- No `any` — use `unknown` with a type guard, or model the type properly
- No non-null assertions (`!`) unless the value is provably non-null by construction; add a comment explaining why
- `readonly` on arrays and object properties that must not be mutated after creation

---

## 2. Angular — Frontend

### Components

- **Standalone only** — never add `NgModule`
- Selector prefix: `app-*` (e.g. `app-patient-list`)
- One component per file; file name matches selector in kebab-case: `patient-list.component.ts`
- Template logic: `@if` / `@for` (Angular 17+ control flow), not `*ngIf` / `*ngFor`
- No logic in templates beyond simple signal reads and `@if`/`@for` blocks — push conditionals into the component class

### Signals

- State lives in signals, never in `BehaviorSubject` or plain class properties
- Signal names describe what they hold: `patients`, `loading`, `selectedPatient`
- Derived values use `computed()` — never recalculate in a getter
- Side-effects (e.g. HTTP calls triggered by state change) use `effect()`

### Services

- One service per domain (e.g. `PatientService`, `AppointmentService`)
- Services are `providedIn: 'root'` (singleton) unless scoped to a feature
- HTTP calls return `Observable` — do **not** `.subscribe()` inside a service; let the component subscribe or use `toSignal()`
- File name: `kebab-case.service.ts`

### HTTP

- `HttpClient` is configured via `provideHttpClient()` in `app.config.ts` — never import `HttpClientModule`
- Base URL in a single constant: `src/app/core/api.config.ts`
- Typed response: always pass a generic `HttpClient.get<MyType>()`

---

## 3. Express — Backend

### File layout

```
backend/
  server.js          ← entry point, app setup
  routes/
    patients.js      ← one file per resource
    appointments.js
  db/
    database.js      ← sql.js init + save() helper
```

### Route conventions

- REST resource paths: plural nouns — `/api/patients`, `/api/appointments`
- HTTP verbs: `GET` list, `GET /:id` detail, `POST` create, `PUT /:id` full update, `PATCH /:id` partial, `DELETE /:id`
- Always send `{ error: "human-readable message" }` on 4xx/5xx — never expose stack traces

### SQLite / sql.js

- Call `save()` after **every** write operation (`INSERT`, `UPDATE`, `DELETE`)
- Wrap mutations in a try/catch; roll back or log on failure
- Use parameterised queries — never interpolate user input into SQL strings

---

## 4. Naming

| Thing | Convention | Example |
|---|---|---|
| Files (frontend) | kebab-case | `patient-list.component.ts` |
| Files (backend) | kebab-case | `patients.js` |
| Components | PascalCase class | `PatientListComponent` |
| Services | PascalCase class | `PatientService` |
| Signals | camelCase noun | `patients`, `loading` |
| Constants | UPPER_SNAKE | `API_BASE_URL` |
| Types / interfaces | PascalCase | `Patient`, `AppointmentSlot` |

---

## 5. Error handling

- Frontend: catch HTTP errors in the service or component, set an error signal, show an inline message — never `console.error` only
- Backend: use `express-async-errors` or explicit try/catch on every async route handler
- Never swallow errors silently — at minimum log and re-throw

---

## 6. Code style

- No comments that explain *what* the code does — the code should be self-documenting
- Comments only for non-obvious *why*: a hidden constraint, a workaround, a surprising invariant
- No trailing `console.log` left in committed code
- Max function length: ~30 lines — split if longer
- Prefer `const` over `let`; never use `var`

---

## 7. Pre-commit checklist

- [ ] `ng build` exits 0 (no TypeScript errors)
- [ ] No `any`, no unused imports, no `console.log` left in
- [ ] Every SQLite write has a `save()` call
- [ ] New API endpoints return `{ error: "..." }` on failure
- [ ] Signal names describe their content, not their type
