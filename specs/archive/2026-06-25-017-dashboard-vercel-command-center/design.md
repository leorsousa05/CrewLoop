# Design: Dashboard Vercel-Style Command Center

## 7 Analysis Questions

1. **Domain and bounded context placement?**
   The change lives entirely inside the dashboard frontend bounded context (`servers/dashboard/ui/`). The server remains a thin event broadcaster. The new concepts — command palette, filters, settings, pins, and views — are presentation-layer concerns only and do not leak into the server-side event model.

2. **Core responsibilities of new/changed components?**
   - `Sidebar`: persistent view navigation.
   - `TopBar`: brand, command-palette trigger, breadcrumbs, status indicators.
   - `CommandPalette`: global fuzzy search and navigation.
   - `FilterBar`: shared filter controls used by list-based views.
   - View components: render domain-specific data (Overview, Sessions, Timeline, Network, Files, Skills, Settings).
   - `useFilters`, `useSettings`, `usePinnedSessions`: client-side state management and persistence.
   - `lib/search.ts`, `lib/export.ts`: pure helpers for search ranking and JSON export.
   - `App.tsx`: orchestrates layout, routing between views, and shared contexts.

3. **Contracts (interfaces, types, APIs) to define or change?**
   - Extend the local `View` union to seven entries.
   - Define `FilterState`, `DashboardSettings`, `PinnedSession`, `CommandPaletteItem`, and helper function signatures.
   - Keep `ClientSession`, `ClientEvent`, and WebSocket messages unchanged.
   - Add no server API changes.

4. **Which parts need tests per TDD skip criteria?**
   - Pure filter/search/export helpers (branching, external deps via clipboard, public API).
   - Settings serialization/deserialization.
   - Command-palette item ranking (branching, string manipulation).
   - Existing server tests remain unchanged.

5. **Architecture that minimizes ambiguity?**
   A small, explicit global state layer using React Context for filters, settings, and pinned sessions. Views receive read-only derived data and callbacks. Pure helpers handle all projection and filtering logic. This mirrors the existing `useSessions`/`useTheme` pattern and keeps business rules testable without React.

6. **Project structure changes needed?**
   Add components, hooks, and helpers under `servers/dashboard/ui/src/`; reorganize `App.tsx`; delete or rename the old `ViewTabs` if replaced. No server changes. Update `README.md`.

7. **Key trade-offs?**
   - **Single large delivery** vs. incremental rollout: the user explicitly asked for a single delivery, so all views ship together, increasing review surface.
   - **Context vs. prop drilling**: Context keeps `App.tsx` clean but couples views to global state shape. Mitigate by exposing only derived values.
   - **Filter scope** — global filters vs. per-view filters. Global filters are simpler and match command-center patterns, but Network filtering is harder. Mitigate by applying filters only where meaningful.
   - **LocalStorage** — easy persistence, but schema migrations must be graceful.

## Architecture

The dashboard becomes a single-page command center with a fixed chrome (sidebar + top bar) and a swappable main area.

Patterns:

- **Component-driven UI** — each view is a self-contained component.
- **Context for cross-cutting state** — `FilterProvider`, `SettingsProvider`, `PinnedSessionsProvider` avoid prop drilling.
- **Custom hooks for side effects** — `useCommandPalette`, `useFilters`, `useSettings`, `usePinnedSessions`, `useKeyboardShortcut`.
- **Pure view-model helpers** — search ranking, filter predicates, export formatting, and aggregation live in `ui/src/lib/` and are tested with Vitest.
- **Declarative routing** — `App.tsx` maps `View` to a component; no external router.
- **Command pattern** — command-palette actions are plain functions that mutate view/filter state.
- **Strategy pattern** — filter predicates and sort comparators are swappable by field.

## Directory structure

```
servers/dashboard/
├── src/                              # server source — unchanged
│   ├── adapters/
│   ├── api/
│   ├── filters/
│   ├── lib/
│   ├── skills/
│   ├── state.ts
│   ├── presenter.ts
│   ├── server.ts
│   ├── types.ts
│   └── tests/
├── ui/
│   ├── index.html                    # unchanged Vite entry
│   ├── vite.config.ts                # unchanged
│   ├── tailwind.config.js            # may add new semantic tokens via Designer
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── main.tsx                  # unchanged
│       ├── App.tsx                   # REWRITTEN: layout + view routing + contexts
│       ├── lib/
│       │   ├── types.ts              # client type mirrors + new local types
│       │   ├── format.ts             # existing
│       │   ├── invocations.ts        # existing
│       │   ├── paths.ts              # existing
│       │   ├── graph.ts              # existing
│       │   ├── constants.ts          # existing; extend with view icons
│       │   ├── search.ts             # NEW: fuzzy search + command palette ranking
│       │   ├── filter.ts             # NEW: filter predicates + option builders
│       │   ├── export.ts             # NEW: JSON export builder
│       │   └── settings.ts           # NEW: settings schema + localStorage I/O
│       ├── hooks/
│       │   ├── useWebSocket.ts       # existing
│       │   ├── useSessions.ts        # existing; may expose derived sessions
│       │   ├── useTheme.ts           # existing; moved into settings or kept
│       │   ├── useFilters.ts         # NEW: filter state + derived filtered invocations
│       │   ├── useSettings.ts        # NEW: persisted settings + theme/density
│       │   ├── usePinnedSessions.ts  # NEW: pinned session ids
│       │   ├── useCommandPalette.ts  # NEW: open/close + item building
│       │   └── useKeyboardShortcut.ts# NEW: generic shortcut hook
│       ├── contexts/
│       │   ├── FilterContext.tsx     # NEW
│       │   ├── SettingsContext.tsx   # NEW
│       │   └── PinnedSessionsContext.tsx # NEW
│       ├── components/
│       │   ├── Sidebar.tsx           # NEW: persistent navigation
│       │   ├── TopBar.tsx            # NEW: brand, search trigger, status
│       │   ├── CommandPalette.tsx    # NEW: modal global search
│       │   ├── FilterBar.tsx         # NEW: shared filter controls
│       │   ├── ViewHeader.tsx        # NEW: title + actions for current view
│       │   ├── ActiveSkillCard.tsx   # existing, possibly reused in Overview
│       │   ├── TelemetryPanel.tsx    # existing, reused in Overview/Sidebar
│       │   ├── ActivityGraph.tsx     # existing, reused in Overview
│       │   ├── Header.tsx            # REMOVED or merged into TopBar
│       │   ├── SessionSelector.tsx   # existing, moved into Sessions view / TopBar
│       │   ├── ViewTabs.tsx          # REMOVED (replaced by Sidebar)
│       │   ├── Timeline.tsx          # MODIFIED: consumes filters + density
│       │   ├── TimelineRow.tsx       # MODIFIED: copy action + density classes
│       │   ├── Network3D.tsx         # MODIFIED: filter-aware node/link hiding
│       │   ├── NetworkDetails.tsx    # existing
│       │   ├── FileActivity.tsx      # MODIFIED: consumes filters + density
│       │   ├── FileList.tsx          # MODIFIED: density classes
│       │   ├── FileDiff.tsx          # existing
│       │   └── views/
│       │       ├── Overview.tsx      # NEW
│       │       ├── SessionsView.tsx  # NEW
│       │       ├── TimelineView.tsx  # NEW: wraps Timeline + FilterBar
│       │       ├── NetworkView.tsx   # NEW: wraps Network3D + FilterBar
│       │       ├── FilesView.tsx     # NEW: wraps FileActivity + FilterBar
│       │       ├── SkillsView.tsx    # NEW
│       │       └── SettingsView.tsx  # NEW
│       └── styles/
│           └── index.css             # extend with density + layout tokens
├── public/                           # unchanged static assets
├── dist/                             # build output (gitignored)
├── package.json                      # unchanged; no new deps expected
└── README.md                         # update docs
```

Notes:

- The Designer will produce `design-ui.md` with exact spacing, color tokens, typography, and motion values. This design spec defines structure, contracts, and behavior only.
- `Header.tsx` and `ViewTabs.tsx` from spec 016 are removed because their responsibilities move to `TopBar` and `Sidebar`.

## Data contracts

### View routing

```typescript
export type View =
  | 'overview'
  | 'sessions'
  | 'timeline'
  | 'network'
  | 'files'
  | 'skills'
  | 'settings';
```

Rules:

- Default view on load is `'overview'`.
- The active view is reflected in the Sidebar highlight and in the main content area.
- View state is not persisted in the URL; a future spec may add query params.

### FilterState

```typescript
export type TimeRange =
  | 'all'
  | '1m'
  | '5m'
  | '15m'
  | '1h'
  | '24h'
  | 'session';

export interface FilterState {
  query: string;
  sources: AgentSource[];
  skills: string[];
  statuses: EventStatus[];
  tools: string[];
  opTypes: ('read' | 'edit' | 'other')[];
  timeRange: TimeRange;
}
```

Rules:

- An empty array means "no restriction" for every multi-select field.
- `query` is a free-text string matched against tool name, detail, skill, resolved path, and snippet.
- `timeRange` is relative to `now` except `'session'`, which uses the selected session's start/end bounds.
- `opTypes` classify tools using the existing `operationType(tool)` helper.

### DashboardSettings

```typescript
export type Theme = 'dark' | 'light' | 'system';
export type Density = 'compact' | 'comfortable';

export interface DashboardSettings {
  theme: Theme;
  density: Density;
  reducedMotion: boolean;
  autoFollowActive: boolean;
  maxEvents: number;
}
```

Rules:

- Defaults: `theme = 'system'`, `density = 'comfortable'`, `reducedMotion = false`, `autoFollowActive = true`, `maxEvents = 100`.
- Settings are persisted to `localStorage` under key `crewloop-dashboard-settings`.
- `reducedMotion` is initialized from `prefers-reduced-motion: reduce` on first load if no setting exists.
- `theme` resolution follows the existing `useTheme` logic.

### PinnedSession

```typescript
export interface PinnedSession {
  id: string;
  pinnedAt: number;
}
```

Rules:

- Persisted to `localStorage` under key `crewloop-dashboard-pins`.
- Pinned sessions sort to the top of the Sessions list and session selector.
- If a pinned session no longer exists in the server's session map, it still appears in the pin list but is shown as stale/gray until unpinned.

### CommandPaletteItem

```typescript
export interface CommandPaletteItem {
  id: string;
  type: 'view' | 'session' | 'skill' | 'tool' | 'file' | 'event' | 'action';
  title: string;
  subtitle?: string;
  icon?: string;
  keywords?: string[];
  action(): void;
}
```

Rules:

- Items are built from the current view, sessions, skills observed in events, tools observed, files touched, recent events, and static actions (e.g., "Export events", "Toggle density").
- Selecting an item calls `action()` and closes the palette.
- The palette filters items by fuzzy matching `title`, `subtitle`, and `keywords`.

### Filter engine API

```typescript
export interface FilterOptions {
  sources: AgentSource[];
  skills: string[];
  statuses: EventStatus[];
  tools: string[];
  opTypes: ('read' | 'edit' | 'other')[];
}

export interface FilterEngine {
  buildOptions(
    sessions: Map<string, ClientSession>,
    selectedSessionId: string | null
  ): FilterOptions;

  filterInvocations(
    invocations: ToolInvocation[],
    session: ClientSession | undefined,
    filters: FilterState,
    now: number
  ): ToolInvocation[];

  filterSessions(
    sessions: ClientSession[],
    filters: FilterState,
    pins: PinnedSession[],
    now: number
  ): ClientSession[];

  filterGraph(
    graph: Graph3D,
    invocations: ToolInvocation[],
    filters: FilterState
  ): Graph3D;
}
```

Rules:

- `buildOptions` derives available filter values from the selected session (or all sessions for the Sessions view).
- `filterInvocations` applies text query, source, skill, status, tool, op-type, and time filters.
- `filterSessions` applies source, skill, status, and time filters to sessions.
- `filterGraph` hides nodes/edges that are not matched by the current tool/file filters, preserving the skill root.

### Search ranking API

```typescript
export interface SearchEngine {
  score(item: CommandPaletteItem, query: string): number;
  search(items: CommandPaletteItem[], query: string): CommandPaletteItem[];
  matchesInvocation(inv: ToolInvocation, query: string): boolean;
}
```

Rules:

- `score` returns `0` for no match and a positive number for matches.
- Matches are case-insensitive and token-based; every token must match somewhere.
- `search` returns items sorted by descending score, capped at 50 results.
- `matchesInvocation` is used by `FilterEngine.filterInvocations` for the text query.

### Export API

```typescript
export interface ExportableEvent {
  id: string;
  timestamp: number;
  tool?: string;
  eventType: string;
  status: string;
  skill?: string;
  detail?: string;
  path?: string;
  durationMs?: number;
}

export interface ExportController {
  toJson(events: ExportableEvent[]): Blob;
  download(blob: Blob, filename: string): void;
  filename(extension: 'json'): string;
}
```

Rules:

- JSON export is an array of `ExportableEvent` objects; only sanitized scalar fields are included.
- Filenames follow `crewloop-events-YYYY-MM-DD-HHMMSS.json`.
- Export reflects the currently filtered set when invoked from Timeline or Files views.

### Settings storage API

```typescript
export interface SettingsStore {
  load(): DashboardSettings;
  save(settings: DashboardSettings): void;
  migrate(partial: unknown): DashboardSettings;
}
```

Rules:

- `migrate` fills missing fields with defaults so localStorage schema changes do not corrupt state.
- `save` writes after every meaningful settings change (debounced 250ms if needed).

## Flows

### Initial load

1. `main.tsx` mounts `App.tsx`.
2. `App.tsx` loads settings from localStorage and applies theme/density classes.
3. `App.tsx` renders `SettingsProvider`, `PinnedSessionsProvider`, `FilterProvider`, and `SessionsProvider` (from existing hook) contexts.
4. `useWebSocket` connects to `/ws`.
5. `snapshot` arrives; sessions populate.
6. Default view is `'overview'` unless overridden by command palette action.

### Switching views

1. User clicks a Sidebar item or selects a command palette view item.
2. `App.tsx` updates `activeView`.
3. The main content area renders the corresponding view component.
4. `ViewHeader` updates title and view-level actions.

### Command palette

1. User presses `Cmd/Ctrl+K` or clicks the search button in `TopBar`.
2. `CommandPalette` modal opens with focus trapped in the search input.
3. `useCommandPalette` builds items from current sessions, skills, tools, files, events, and static actions.
4. User types a query; `SearchEngine.search` ranks and filters items.
5. User selects an item via arrow keys + Enter or click.
6. The item's `action()` runs (e.g., change view, select session, apply filter), and the palette closes.
7. `Esc` closes the palette without action.

### Filtering

1. User opens `FilterBar` and selects one or more values or types a query.
2. `FilterContext` updates `FilterState`.
3. `useFilters` recomputes derived filtered invocations/sessions/graph.
4. List views re-render with the filtered set; Network view receives a filtered graph.
5. The filter bar shows the active filter count and a clear-all button.

### Pinning a session

1. In the Sessions view or session selector, user clicks a pin icon.
2. `PinnedSessionsContext` adds the session id with `pinnedAt` timestamp.
3. `useSessions` derived list sorts pinned sessions first.
4. Pins persist to localStorage.

### Exporting events

1. In Timeline or Files view, user clicks "Export JSON".
2. The view reads the current filtered invocation list and maps it to `ExportableEvent[]`.
3. `ExportController.toJson` builds a Blob.
4. `ExportController.download` triggers a transient `<a>` click.

### Copying an event

1. In Timeline view, user clicks a copy icon on a row or in the expanded detail.
2. The row maps the invocation to a compact JSON string.
3. `navigator.clipboard.writeText` copies it.
4. A transient toast/inline confirmation appears.

## UI layout

High-level chrome (Vercel-style):

```
+-----------------------------------------------------------+
| TopBar  [≡]  CREWLOOP · Dashboard    [🔍] [status] [🌙]   |
+------------+----------------------------------------------+
| Sidebar    | Main content                                 |
| · Overview | · ViewHeader                                 |
| · Sessions | · FilterBar (when relevant)                  |
| · Timeline | · View content                               |
| · Network  |                                              |
| · Files    |                                              |
| · Skills   |                                              |
| · Settings |                                              |
+------------+----------------------------------------------+
```

- **Sidebar** width: `16rem` on desktop, collapses to icon-only at `≤1024px`, hidden behind a drawer on mobile. Exact values in `design-ui.md`.
- **TopBar** height: `3.5rem`, fixed at the top, `z-index` above content.
- **Main content** scrolls internally; the chrome never scrolls.

Responsive behavior:

- **Desktop (≥1024px):** full sidebar + top bar + main content grid.
- **Tablet (768–1023px):** icon-only sidebar; main content adjusts.
- **Mobile (<768px):** sidebar becomes a slide-out drawer; top bar shows a menu button.

## State management

- `App.tsx` owns `activeView` as local state.
- `SettingsContext` owns `DashboardSettings` and persists it.
- `PinnedSessionsContext` owns pinned ids and persists them.
- `FilterContext` owns `FilterState`; does not persist across reloads (keep ephemeral).
- `useSessions` continues to own the session map and selected session.

No external state library is added. Context providers wrap the app near the root.

## Theming and density

- Theme class (`dark`/`light`) is applied to `<html>` via `SettingsContext`.
- Density class (`density-compact`/`density-comfortable`) is applied to `<html>` or a wrapper div.
- Tailwind variants or arbitrary classes read the density class to adjust padding/height.
- Reduced motion is checked via media query and the `reducedMotion` setting; whichever is true disables motion.

## Backend changes

None. The server continues to serve the built UI from `dist/public/` and broadcast events on `/ws`. The event contract is unchanged.

## Testing plan

- **Unit (Vitest):**
  - `filterInvocations` returns correct subsets for combined filters.
  - `filterSessions` respects source/status/time filters and pin ordering.
  - `filterGraph` hides unmatched tools/files while keeping the skill root.
  - `matchesInvocation` matches tool, detail, skill, path, and snippet case-insensitively.
  - `score` ranks command-palette items correctly.
  - `toJson` produces a valid JSON blob with sanitized scalar fields.
  - `settings.migrate` fills missing fields and ignores invalid values.
- **Build:**
  - `npm run typecheck` passes for server and UI.
  - `npm run build` produces `dist/public/` with no errors.
- **Integration:**
  - Start the server and load the UI; verify WebSocket snapshot and sidebar navigation.
- **Manual:**
  - Switch between all seven views.
  - Open command palette with `Cmd/Ctrl+K`, search, and navigate.
  - Apply each filter dimension and verify visible results.
  - Pin/unpin sessions and reload to confirm persistence.
  - Export JSON from Timeline and Files.
  - Copy an event to the clipboard.
  - Toggle density and theme; confirm persistence.
  - Enable OS reduced motion; confirm no animations.
- **Accessibility:**
  - Tab through Sidebar, TopBar, command palette, and filters.
  - Confirm focus trap in command palette.
  - Confirm ARIA labels on icon-only buttons.

## Risks and trade-offs

- **Large single delivery:** more files and interactions to review. Mitigation: keep helpers pure, views isolated, and write focused tests.
- **Context re-render performance:** global filter changes could re-render the whole app. Mitigation: memoize derived data in `useFilters` and split contexts so only relevant consumers re-render.
- **Filter state ambiguity:** global filters may feel unexpected in Network view. Mitigation: show which filters are active and only hide nodes that do not match; the skill node always remains visible.
- **Command palette data volume:** large sessions could produce thousands of items. Mitigation: cap recent events at 50, deduplicate skills/tools/files, and rank results.
- **localStorage schema drift:** future settings changes may break stored data. Mitigation: use `migrate` with defaults for every field.
- **Accessibility of modal:** command palette must trap focus and restore focus on close. Mitigation: use a small focus-trap hook and `aria-modal`.

## Subagent plan

This task is **not suitable for parallel subagents**. The new views, command palette, filters, and settings share the same global state contexts and styling tokens. Splitting them would create coordination overhead and risk inconsistent UI. A single Engineer should implement the redesign sequentially.
