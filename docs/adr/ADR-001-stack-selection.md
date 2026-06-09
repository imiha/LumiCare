# ADR-001 — Stack selection — Angular + Express + SQLite

**Date:** 2026-06-09  
**Status:** Accepted  
**Deciders:** PO, Dev team

---

## Context

Clinique Lumière needs a desktop-first clinic management app for receptionists. The team is small, the scope is a single sprint, and zero native build tooling should be required on developer machines.

## Decision

We will use **Angular 18** (standalone components + signals) for the frontend, **Node.js + Express 4** for the REST API, and **SQLite via `sql.js`** (pure-JS, no native bindings) for persistence.

## Alternatives considered

| Option | Reason rejected |
|---|---|
| React + Vite | Team has more Angular familiarity; signals reduce boilerplate vs useState |
| Next.js full-stack | Overkill for a desktop-first internal tool with no SSR requirement |
| PostgreSQL / MySQL | Requires a running DB server — adds ops burden for a small single-machine clinic |
| better-sqlite3 | Requires native compilation via node-gyp, blocked on some clinic machines |

## Consequences

**Positive:** No native build tools needed; Angular signals keep state simple; Express is easy to extend.  
**Negative / trade-offs:** `sql.js` loads the entire DB into memory — fine for clinic scale (<10 k rows) but not suitable for large data volumes.  
**Risks:** Every write must call `save()` explicitly; forgetting it silently loses data. Mitigated by a lint rule and code-review checklist item.
