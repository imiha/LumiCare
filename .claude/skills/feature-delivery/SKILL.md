# Feature Delivery Skill — Clinique Lumière

Captures exactly how Claude has delivered features on this project. Load this at the start of every implementation session.

---

## Delivery Checklist — Every Story

Before starting:
- [ ] Re-read the relevant story section in `PRD.md`
- [ ] Check `docs/adr/` for decisions that affect the feature
- [ ] Create branch: `git checkout -b story/<id>-short-description`

While building (all in one go — do NOT split into separate rounds):
- [ ] Implementation code
- [ ] Unit tests
- [ ] ADR (if a significant architecture decision was made)

After building:
- [ ] `npx ng build` — must pass with zero TypeScript errors
- [ ] `npx ng test --no-watch --browsers=ChromeHeadless` — must be all green
- [ ] Commit, push, open PR

---

## Parallel Agent Strategy

Split every epic into **3 simultaneous agents** so all files land in one commit:

| Agent | Owns |
|---|---|
| **Backend** | `backend/db/database.js` (schema + seed), `backend/routes/*.js`, `backend/server.js` |
| **Frontend core** | Models (`core/models/`), services (`core/services/`), shared components (`shared/`), route + nav updates |
| **Frontend feature + tests** | Feature components (`features/<name>/`), all `*.spec.ts` files for backend service AND all feature components |

If the spec files are too numerous for agent 3, add a 4th agent dedicated to tests — but never skip tests.

---

## Backend Patterns

### database.js — schema is always safe to re-run

```js
async function initDb() {
  const SQL = await initSqlJs();
  db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  createSchema();          // CREATE TABLE IF NOT EXISTS — safe on existing DB

  const count = db.exec('SELECT COUNT(*) FROM my_table')[0].values[0][0];
  if (count === 0) seedMyTable();

  save();
  return db;
}
```

### Route pattern

Every route file exports `{ router, setDb }`. `setDb` receives `(db, save)` for write routes or just `(db)` for read-only routes.

```js
let db, save;
function setDb(database, saveFunc) { db = database; save = saveFunc; }
module.exports = { router, setDb };
```

`server.js` calls `setDb` inside the `initDb().then()` before mounting routes.

### Conflict detection — 409 pattern

```js
const conflict = db.exec(`
  SELECT id FROM appointments
  WHERE practitioner_id = ? AND date = ?
    AND status NOT IN ('cancelled')
    AND NOT (end_time <= ? OR start_time >= ?)
`, [practitionerId, date, startTime, endTime]);

if (conflict.length > 0 && conflict[0].values.length > 0) {
  return res.status(409).json({ error: `Time slot conflict: ...` });
}
```

### API error shape

Always `{ error: "human-readable message" }` — never raw exceptions.

---

## Frontend Patterns

### Angular 18 — key rules

- **Standalone components only** — no NgModule
- **Signals for state** — `signal()`, `computed()`, `effect()`
- **`effect()` that writes signals** needs `{ allowSignalWrites: true }` or NG0600 is thrown at runtime
- **Signal inputs** — `input<T>()` or `input.required<T>()`; set in tests via `fixture.componentRef.setInput('name', value)`
- **Outputs** — `output<T>()` returns `OutputRef<T>` with `.subscribe()`; NOT `@Output() EventEmitter`
- **HTTP** — `HttpClient` via `inject(HttpClient)`; configured once in `app.config.ts` via `provideHttpClient()`

### Service pattern

```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';
  // return Observable<T> for every method
}
```

### Container / presenter split

- **Container** owns signals and API calls; passes data down via `input()`, listens via `output()`
- **Presenter** (form, list) emits events upward; never calls the API directly except for its own local actions (e.g. cancel in the list)

### CSS custom properties (all defined in `styles.scss`)

`--navy`, `--navy-light`, `--navy-card`, `--gold`, `--gold-light`, `--text`, `--text-muted`, `--border`, `--danger`, `--success`

Global utility classes: `.btn-primary`, `.btn-ghost`, `.card`, `.error-text`

---

## Testing Patterns

### What to test per file type

| File type | What to cover |
|---|---|
| Service (`*.service.spec.ts`) | HTTP method, exact URL (incl. query params), request body, response shape — use `HttpClientTestingModule` + `HttpTestingController` |
| Container component | `ngOnInit` API call, signal state after load, output handler methods (date change, created, cancelled) |
| Form component | Validation (invalid/valid states), disabled button, success emission + form reset, 409 error display, `submitting` signal lifecycle |
| List component | Row rendering, empty/loading states, output emissions, action flows (cancel, select) |
| Simple display component | Input → correct CSS class / text content |

### Common test setup

```typescript
beforeEach(async () => {
  mockService = jasmine.createSpyObj('MyService', ['methodA', 'methodB']);
  mockService.methodA.and.returnValue(of(MOCK_DATA));

  await TestBed.configureTestingModule({
    imports: [MyComponent],
    providers: [{ provide: MyService, useValue: mockService }],
  }).compileComponents();

  fixture = TestBed.createComponent(MyComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});
```

### Key pitfalls

**`fakeAsync` timer leaks** — any `setTimeout` inside a component method must be flushed. If the component has `setTimeout(..., 3000)` (e.g. auto-clearing a success flag), every test that triggers that path needs `tick(3000)` before the test ends.

**Output capture** — use `let emitted: T | undefined` (not `T | null = null`) to avoid Jasmine's `Expected<null>` TS error:
```typescript
let emitted: Patient | undefined;
const sub = component.myOutput.subscribe((v: Patient) => (emitted = v));
// ... trigger ...
expect(emitted).toEqual(expected);
sub.unsubscribe();
```

**`cancelling` signal capture during request** — when checking a signal value mid-request use `callFake` and non-null assert in the expectation:
```typescript
mockService.cancel.and.callFake(() => { captured = component.cancelling(); return of(result); });
expect(captured!).toBe(expectedId);
```

**Signal inputs in tests** — always `fixture.componentRef.setInput('name', value)`, never direct property assignment.

---

## ADR Guidance

Write an ADR (`docs/adr/ADR-NNN-short-title.md`) whenever the implementation makes a choice that:
- Affects multiple files or layers (e.g. "where does conflict detection live?")
- Would surprise a future developer (e.g. optimistic update instead of re-fetch)
- Rejects a reasonable alternative that might be revisited

Number sequentially. Use the template at `docs/adr/ADR-000-template.md`.

---

## CHANGELOG

After every completed story add one line to `CHANGELOG.md`:
```
## [YYYY-MM-DD] Story X.Y.Z — short description
What changed and why (one line).
```
