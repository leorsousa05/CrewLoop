# ADR 003: Dashboard UI Navigation Model — Hash Routing + Single Registry

- **Status:** accepted
- **Date:** 2026-07-14
- **Spec:** `specs/changes/023-dashboard-full-redesign/`

## Context

The dashboard UI (spec-022 baseline) keeps view, selected session, and filters only in React state. Refresh loses all context, nothing is shareable, and back/forward do nothing. The navigation registry is also duplicated (`VIEWS` in `App.tsx`, `ITEMS` in `Sidebar.tsx`), and the two navigation entry points behave inconsistently (only the command palette resets filters on view change). Spec 023 requires deep-linking and a single source of truth for navigation, under a hard constraint: **no new dependencies**.

## Decision

1. **Hash-based routing** via a small in-house hook (`useHashRoute`) and a pure serializer module (`route.ts`). URL shape: `#/<view>[?params]`, carrying view, selected session, non-default filters, selected file, and session sort.
2. **A single navigation registry** (`NAV_ITEMS` in `lib/navigation.ts`) consumed by App, Sidebar, CommandPalette, TopBar, and the shortcuts table. View changes go through `navigate()` with `push`; refinements (filters, selection, sort) use `replace`.

## Alternatives Considered

| Alternative | Verdict | Reason |
|-------------|---------|--------|
| `react-router` (or similar) | Rejected | New dependency — explicitly forbidden by the spec constraints; heavy for six state-switched views |
| History API path routing (`/timeline`) | Rejected | Requires SPA fallback/rewrite rules in the dashboard's static file server — a backend change, out of scope |
| Keep state-only (no URL) | Rejected | Fails the deep-linking requirement (refresh/back/share) |
| Full URL serialization of all filters always | Rejected | Noisy URLs; only non-default filter values are serialized |

## Consequences

**Positive:**
- Refresh, back/forward, and shareable URLs work with zero server changes and zero new dependencies.
- Sidebar and command palette navigation become behaviorally identical (both call `navigate`).
- Adding/renaming a view touches exactly one array (`NAV_ITEMS`).
- The pure serializer (`route.ts`) is fully unit-testable without DOM.

**Negative / mitigations:**
- Hash URLs are slightly less clean than path URLs — acceptable for a local developer tool.
- URL becomes untrusted input — mitigated by enum validation and graceful fallback to `DEFAULT_ROUTE` in `parseRoute`.
- Two sources of truth during hydration (URL vs contexts) — mitigated by a strict rule: URL hydrates contexts on load and on `hashchange`; afterwards contexts are the working copy and `navigate()` writes through to both.
