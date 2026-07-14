# Design: Dashboard Full Redesign — Structure & Visual System

## Overview

This spec restructures the dashboard's information architecture and interaction model while redoing every component's visual composition. It builds directly on the uncommitted spec-022 working tree (SaaS minimalist tokens). The work has two tightly coupled layers:

1. **Skeleton (this document):** single navigation registry, hash-based deep-linking, keyboard model, pause model, responsive master-detail, type-scale vocabulary, dead-code removal.
2. **Skin (`design-ui.md`, authored by the Designer):** exact token values, per-component visual specs, layout compositions, motion table, responsive rules, accessibility checklist — evolving the SaaS minimalist direction.

The skeleton defines *what each piece is and how it behaves*; the Designer defines *how it looks*. Engineer implements both, phase by phase.

## Analysis (7 Questions)

1. **Domain and bounded context placement?** Everything lives in the dashboard UI bounded context (`servers/dashboard/ui/`). New pure logic goes to `ui/src/lib/` (navigation, route, shortcuts) alongside `filter.ts`/`export.ts`; new stateful glue goes to `ui/src/hooks/`; presentational changes stay in `ui/src/components/`. No server-context files are touched.
2. **Core responsibilities of new/changed components?** `navigation.ts` owns the canonical view registry; `route.ts` owns URL serialization (pure, testable); `useHashRoute` owns URL↔state synchronization; `App.tsx` orchestrates (hydrate contexts from URL on load, write back on change); `PauseBanner` renders the pause state already computed by App; views own only their internal composition.
3. **Contracts to define or change?** New: `NavItem`, `RouteState`, `SerializedFilterState`, `Shortcut`, `SessionSortKey`, `PauseModel`, and the `useHashRoute` return type. Changed: `FilterEngine` loses `filterGraph`; `TimelineView`/`FilesView`/`SessionsView` prop contracts gain route-driven fields (exact signatures below). Unchanged: all server types, contexts, `DashboardSettings`.
4. **Which parts need tests per TDD skip criteria?** `route.ts` (branching parse/serialize — test), `sortSessions` (branching + ordering — test), `navigation.ts` registry invariants (cheap guard test). Hooks (`useHashRoute`, `useResizeObserver`) have DOM/browser side effects and no RTL setup exists in this project — they are verified via build + the manual checklist, same convention as spec 022.
5. **Architecture that minimizes ambiguity?** Unidirectional flow preserved: URL → `useHashRoute` → contexts/state → views, and user actions → `navigate()` → URL → re-render. One registry for nav, one serialization layer for the URL, one owner per piece of state. Nothing is derived in two places.
6. **Project structure changes needed?** Three new `lib/` modules, two new hooks, one new component (`PauseBanner`), two deletions (`ViewHeader.tsx`, `useTheme.ts`). No moves, no renames of existing files.
7. **Key trade-offs?** Hash routing over a router dependency (uglier URLs, zero deps, no server config). Drill-down over responsive split-pane on mobile (one extra tap, actually usable). No timeline virtualization (simpler rows, bounded by `maxEvents`). Slightly more App-level state (pause model, route) in exchange for eliminating duplicated derivation elsewhere.

## Proposed Directory & File Structure

```
servers/dashboard/ui/
├── index.html                            (UNCHANGED — fonts already loaded)
├── tailwind.config.js                    (Modified — register named fontSize tokens)
├── vite.config.ts                        (Modified — remove vendor-graph chunk)
└── src/
    ├── styles/
    │   └── index.css                     (Modified — type-scale vars, sheet/popover responsive rules)
    ├── lib/
    │   ├── types.ts                      (Modified — drop Graph3D/filterGraph; add RouteState, SessionSortKey)
    │   ├── filter.ts                     (Modified — drop filterGraph; add sortSessions)
    │   ├── filter.test.ts                (Modified — drop graph tests; add sortSessions tests)
    │   ├── export.ts                     (UNCHANGED)
    │   ├── navigation.ts                 (NEW — NAV_ITEMS registry)
    │   ├── route.ts                      (NEW — parse/serialize pure functions)
    │   ├── route.test.ts                 (NEW)
    │   └── shortcuts.ts                  (NEW — SHORTCUTS registry)
    ├── hooks/
    │   ├── useHashRoute.ts               (NEW)
    │   ├── useResizeObserver.ts          (NEW)
    │   ├── useTheme.ts                   (DELETED — no importers)
    │   └── *.ts                          (UNCHANGED)
    ├── contexts/                         (UNCHANGED — public APIs preserved)
    ├── App.tsx                           (Modified — route-driven state, pause model, global shortcuts)
    └── components/
        ├── TopBar.tsx                    (Modified — single title, mobile connection dot)
        ├── Sidebar.tsx                   (Modified — consumes NAV_ITEMS)
        ├── CommandPalette.tsx            (Modified — consumes NAV_ITEMS)
        ├── ViewHeader.tsx                (DELETED)
        ├── FilterBar.tsx                 (Modified — Esc, edge anchoring, mobile sheet, radio time)
        ├── SessionSelector.tsx           (Modified — arrow-key listbox nav)
        ├── ActiveSkillPanel.tsx          (Modified — compact Now strip)
        ├── TelemetryPanel.tsx            (Modified — denser metrics)
        ├── ActivityGraph.tsx             (Modified — ResizeObserver, a11y)
        ├── PauseBanner.tsx               (NEW)
        ├── Timeline.tsx                  (Modified — keyboard nav, pause integration)
        ├── TimelineRow.tsx               (Modified — button row, aria-expanded)
        ├── FileList.tsx                  (Modified — tree roles, caret icons, EN comment)
        ├── FileDiff.tsx                  (Modified — mobile back slot)
        ├── FileActivity.tsx              (Modified — responsive master-detail)
        ├── ui/
        │   ├── Icon.tsx                  (Modified — add icons if missing)
        │   └── StatusBadge.tsx           (Modified — accessible labels)
        └── views/
            ├── Overview.tsx              (Modified — recomposed, deduplicated)
            ├── SessionsView.tsx          (Modified — valid rows, sort, keyboard)
            ├── TimelineView.tsx          (Modified — pause banner, props)
            ├── FilesView.tsx             (Modified — drill-down via route)
            ├── SkillsView.tsx            (Modified — sole owner of aggregates)
            └── SettingsView.tsx          (Modified — shortcuts section)
```

New files: 6 (`navigation.ts`, `route.ts`, `route.test.ts`, `shortcuts.ts`, `useHashRoute.ts`, `useResizeObserver.ts`, `PauseBanner.tsx` — 7 total). Deleted files: 2 (`ViewHeader.tsx`, `useTheme.ts`). No files outside `servers/dashboard/ui/` except the spec/ADR documents.

## Code Architecture & Design Patterns

- **Architecture model:** unchanged at the boundary level — a unidirectional presentational layer over stable domain types (`lib/` + `hooks/` + `contexts/` as application core; `components/` as DOM adapters). This spec strengthens that model by removing the last duplicated derivations (nav registry, title ownership, aggregate panels).
- **Patterns applied:**
  - **Single Source of Truth (Registry pattern):** `NAV_ITEMS` is the one definition of views; every consumer (sidebar, palette, top bar, shortcuts, routing) derives from it. Adding/renaming a view touches exactly one array.
  - **Pure serializer + effectful adapter (Ports & Adapters):** `route.ts` is a pure port (string ↔ `RouteState`); `useHashRoute` is the adapter to `location.hash`/`hashchange`. Pure part is unit-tested; adapter stays thin.
  - **Strategy (token-driven theming, unchanged):** visual decisions flow through CSS variables; the type scale extends that vocabulary with named font-size tokens.
  - **State hoisting:** the pause model and selected file move to route/App level so any component can reflect them (banner, toolbar, URL) without prop-drilling through intermediates — App passes them directly.
  - **Progressive disclosure (responsive):** Files master-detail collapses to drill-down below `md`; FilterBar popovers collapse to a sheet below `sm`.
- **Non-goal patterns:** no router library, no state-management library, no CSS-in-JS, no new persisted settings.

## Data Model & Contracts

### Navigation registry (`ui/src/lib/navigation.ts`)

```typescript
import type { View } from './types';

export interface NavItem {
  key: View;
  label: string;        // 'Overview'
  icon: string;         // Icon map key, e.g. 'House'
  shortcut: string;     // '1'..'6' — unique across items
  description: string;  // one line, used in palette subtitle / sidebar tooltip
}

export const NAV_ITEMS: readonly NavItem[];
export function getNavItem(view: View): NavItem; // throws on unknown key (impossible by types)
```

Invariant (guarded by a test): `NAV_ITEMS` covers every member of the `View` union exactly once, shortcuts are unique digits, icons exist in the `Icon` map.

### Routing (`ui/src/lib/route.ts` + `ui/src/hooks/useHashRoute.ts`)

URL shape: `#/<view>[?params]` — hash only, so the static server needs no rewrite rules.

```typescript
// ui/src/lib/types.ts (additions)
export type SessionSortKey = 'recent' | 'duration' | 'events' | 'name';

export interface SerializedFilterState {
  q: string;        // FilterState.query
  sources: string;  // comma-joined AgentSource[]
  skills: string;   // comma-joined
  statuses: string; // comma-joined EventStatus[]
  tools: string;    // comma-joined
  ops: string;      // comma-joined opTypes ('read','edit','other')
  time: TimeRange;
}

export interface RouteState {
  view: View;
  sessionId: string | null;                 // selected session (global)
  filters: Partial<SerializedFilterState>;  // only non-default values are serialized
  filePath: string | null;                  // Files detail selection
  sort: SessionSortKey | null;              // Sessions view sort; null = default 'recent'
}
```

```typescript
// ui/src/lib/route.ts
export const DEFAULT_ROUTE: RouteState;

export function parseRoute(hash: string): RouteState;
// - Accepts '', '#', '#/', '#/unknown' → DEFAULT_ROUTE (never throws)
// - Ignores unknown params; drops invalid enum values (time, ops, sources, statuses, sort)

export function serializeRoute(state: RouteState): string;
// - Produces '#/view' plus query params only for non-default values
// - Omits empty filters entirely (clean URLs)

export function filtersToQuery(filters: FilterState): URLSearchParams;
export function filtersFromQuery(params: URLSearchParams): Partial<FilterState>;
// - Round-trip safe: filtersFromQuery(filtersToQuery(f)) deep-equals the non-default subset of f
```

```typescript
// ui/src/hooks/useHashRoute.ts
export interface HashRoute {
  route: RouteState;
  navigate(patch: Partial<RouteState>, mode?: 'push' | 'replace'): void;
  // - 'push' for view changes (back button returns to previous view)
  // - 'replace' (default) for filter/session/file/sort refinements (no history spam)
}
export function useHashRoute(): HashRoute;
```

Hydration rule (App.tsx): on mount, `route` seeds `FilterContext`, selected session, and active view. After mount, contexts are the working copy; `navigate()` writes through to the URL and state together. `hashchange` (back/forward) re-hydrates contexts from the URL.

### Keyboard shortcuts (`ui/src/lib/shortcuts.ts`)

```typescript
export type ShortcutScope = 'global' | 'timeline';

export interface Shortcut {
  keys: string;   // display form: '1', '/', 'Esc', 'j', 'Enter', '⌘K'
  label: string;  // 'Go to Overview'
  scope: ShortcutScope;
}

export const SHORTCUTS: readonly Shortcut[];
```

Binding contract (implemented in App/Timeline via existing `useKeyboardShortcut`):

| Keys | Scope | Action |
|------|-------|--------|
| `1`–`6` | global | Switch to the corresponding `NAV_ITEMS` view (ignored when an input/textarea/contenteditable is focused) |
| `/` | global | Focus the FilterBar search input (views that have one) |
| `Esc` | global | Close topmost overlay: command palette → filter popover/sheet → nothing |
| `⌘K` / `Ctrl+K` | global | Open command palette (existing) |
| `j` / `k` | timeline | Move selection to next/previous row |
| `Enter` | timeline | Expand/collapse the selected row |
| `p` | timeline | Toggle manual pause |

The Settings view renders `SHORTCUTS` as a reference table.

### Pause model

App lifts the existing hover-pause into an explicit model:

```typescript
// App.tsx internal state
interface PauseModel {
  hover: boolean;   // pointer over the timeline list
  manual: boolean;  // user toggled the pause button
}
// derived: paused = hover || manual
// bufferedCount = pendingUpdates.length (existing state)
```

```typescript
// TimelineView props (changed)
interface TimelineViewProps {
  invocations: ToolInvocation[];
  filterOptions: FilterOptions;
  paused: boolean;
  manualPaused: boolean;
  bufferedCount: number;
  onHoverChange(hovering: boolean): void;
  onManualPauseToggle(): void;
  onResume(): void; // clears manual pause; hover-resume flushes via existing effect
}
```

`PauseBanner` props: `{ bufferedCount: number; manual: boolean; onResume(): void }`. It renders only when `paused` is true; copy and placement come from `design-ui.md`. Flushing stays exactly as today (effect on `paused → false`).

### Files master-detail

```typescript
// FilesView props (changed)
interface FilesViewProps {
  files: FileActivityItem[];          // existing buildFileActivity output
  filterOptions: FilterOptions;
  selectedSessionId: string | null;
  selectedPath: string | null;        // from RouteState.filePath
  onSelectPath(path: string | null): void; // navigate({ filePath })
}
```

Layout rule: `md+` renders the existing split pane (list + detail). Below `md`, `selectedPath === null` renders only the list; a selection renders only the detail with a back action that calls `onSelectPath(null)` (browser back also works, since `filePath` is in the URL).

### Sessions sort

```typescript
// ui/src/lib/filter.ts (addition)
export function sortSessions(
  sessions: ClientSession[],
  key: SessionSortKey,
  pins: PinnedSession[],
  now: number
): ClientSession[];
// Pinned sessions always come first (preserving their own order), then the
// unpinned remainder sorted by key: recent = lastActivity desc,
// duration = (endedAt ?? now) - startTime desc, events = events.length desc,
// name = activeSkill?.name ?? id asc (case-insensitive).
```

`SessionsView` reads/writes `sort` through the route (`navigate({ sort })`).

### Type-scale vocabulary (`tailwind.config.js` + `index.css`)

Named tokens only — exact pixel values are assigned by the Designer in `design-ui.md`:

```javascript
// tailwind.config.js — theme.extend.fontSize
{
  'display-2xl': ['var(--text-display-2xl)', { lineHeight: 'var(--leading-display)' }],
  'display-xl':  ['var(--text-display-xl)',  { lineHeight: 'var(--leading-display)' }],
  'display-lg':  ['var(--text-display-lg)',  { lineHeight: 'var(--leading-tight)' }],
  'heading':     ['var(--text-heading)',     { lineHeight: 'var(--leading-tight)' }],
  'body':        ['var(--text-body)',        { lineHeight: 'var(--leading-normal)' }],
  'label':       ['var(--text-label)',       { lineHeight: 'var(--leading-normal)' }],
  'caption':     ['var(--text-caption)',     { lineHeight: 'var(--leading-normal)' }],
  'micro':       ['var(--text-micro)',       { lineHeight: 'var(--leading-normal)' }],
}
```

Rules:
- `display-*` and `heading` use `font-display` (Space Grotesk); `body`/`label`/`caption`/`micro` use the mono family per the current identity — final assignment is the Designer's call within these two families.
- Arbitrary font-size utilities (`text-[…]`, `text-6xl`-style one-offs, fractional paddings like `py-0.2`) are forbidden in the new diff. Reviewer greps for them.
- All eight tokens must exist in both `:root` and `html.light` scopes.

## Flow Diagrams

### Navigation (any entry point)

```
User clicks sidebar / picks palette item / presses digit / loads URL
        │
        ▼
navigate({ view }) ──push──▶ location.hash = '#/view?…'
        │                           │
        │                    hashchange event
        │                           │
        ▼                           ▼
FilterContext reset (view change) ──▶ App re-renders ──▶ Sidebar/TopBar reflect NAV_ITEMS[view]
```

Sidebar and palette now behave identically (both call `navigate`), which fixes the current inconsistency where only the palette resets filters.

### Deep-link hydration (page load)

```
location.hash ──▶ parseRoute ──▶ RouteState
                                     │
        ┌────────────┬───────────────┼────────────────┐
        ▼            ▼               ▼                ▼
   activeView   FilterContext   selectedSessionId   filePath (FilesView)
   (App state)   (hydrated)     (useSessions)       (drill-down)
```

Invalid or empty hashes fall back to `DEFAULT_ROUTE` without errors.

### Timeline pause

```
hover ─┐
       ├─▶ paused = hover || manual ──▶ onMessage buffers into pendingUpdates
manual ┘                                        │
       ▼                                        ▼
PauseBanner (count = pendingUpdates.length)  resume ──▶ paused=false ──▶ flushPending()
```

## State Management

No new contexts and no changes to existing context APIs. New state ownership:

| State | Owner | Persistence |
|-------|-------|-------------|
| `route` (view, session, filters, file, sort) | `useHashRoute` in App | URL hash |
| `PauseModel` | App (`useState`) | none (ephemeral) |
| Timeline selected row | Timeline (`useState`) | none |
| Filter working copy | FilterContext (existing) | hydrated from / mirrored to URL |
| Settings, pins | existing contexts | localStorage (unchanged) |

## Error Handling

- `parseRoute` never throws: unknown view names, invalid enum values, and malformed query strings degrade to `DEFAULT_ROUTE`/dropped params.
- `getNavItem` is total over the `View` union (compile-time guaranteed; runtime throw is unreachable).
- ResizeObserver absence (very old browsers): `useResizeObserver` falls back to a one-time measurement — the graph still renders, just without live resize.
- No new network calls; no new runtime error paths beyond the above.

## Performance Considerations

- `serializeRoute` runs only on user actions, never per frame.
- `hashchange`-driven re-renders reuse the existing memoized derivations in App (`sortedWithPins`, `filteredInvocations`, …).
- ActivityGraph redraw is ResizeObserver-throttled (one draw per animation frame).
- Keyboard handlers ignore events from form fields, avoiding per-keystroke work while typing.
- No new dependencies: bundle size decreases slightly (vendor-graph chunk removal).

## Security Considerations

- Hash params are treated as untrusted input: parsed values are validated against enums and never injected into the DOM as HTML (React escaping only).
- `filePath` from the URL flows into the existing `/api/file-content` / `/api/file-diff` endpoints, which already perform path validation server-side — the UI adds no new trust.
- No `dangerouslySetInnerHTML`, no new dependencies, no new network surface. Reviewer runs the standard secret/AI-artifact scan.

## Test Plan

| Target | Type | Why (TDD criteria) |
|--------|------|--------------------|
| `route.ts` — `parseRoute`/`serializeRoute` round-trip, invalid input fallback, enum validation | unit (new `route.test.ts`) | branching, string I/O |
| `route.ts` — `filtersToQuery`/`filtersFromQuery` round-trip | unit | branching |
| `filter.ts` — `sortSessions` (each key, pins-first invariant, ties) | unit (extend `filter.test.ts`) | branching, ordering |
| `navigation.ts` — registry covers `View` union, unique shortcuts | unit (extend or new small test) | public API surface guard |
| `useHashRoute`, `useResizeObserver` | manual checklist (no RTL in project) | DOM side effects; same convention as spec 022 |
| All existing tests | regression | must stay green after `filterGraph` removal |

## Risks & Deferred Items

Addressed: R1 (IA single-source), R2 (type scale), R3 (density), R4 (deep-linking, shortcuts, pause indicator, keyboard lists, nested buttons), R5 (responsive Files, FilterBar overflow, ResizeObserver, mobile connection), R6 (dead code).

Deferred:

- **Timeline virtualization** — no virtualization library allowed; hand-rolled windowing conflicts with expandable rows. Bounded by the existing `maxEvents` setting. A future spec can revisit with measurement-based windowing.
- **Floating `?` shortcuts overlay** — the Settings shortcuts section covers discoverability; an overlay is polish for a later pass.
- **Session drag-reorder / custom pinning order** — out of scope; pins keep current ordering.
- **Browser/device verification** — deferred to the Reviewer manual checklist, same convention as spec 022 (build + unit tests are the automated gate).

## Subagent Plan

`subagents.approved: false`. The change has a strict dependency chain — type scale + navigation registry → shell rewire (App/TopBar/Sidebar/CommandPalette) → view recompositions → responsive/a11y pass — and shares chokepoint files (`App.tsx`, `index.css`, `tailwind.config.js`) across every phase. Parallel subagents would conflict on those files; sequential phases with per-phase verification are faster and safer here.
