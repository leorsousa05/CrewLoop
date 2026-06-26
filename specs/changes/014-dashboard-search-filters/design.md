# Design: Dashboard Search, Filters, Sorting, Export, and Keyboard Shortcuts

## Architecture

The dashboard remains a vanilla JS SPA over WebSocket. The server continues to be a thin event store. All new behavior is client-side presentation logic layered on top of the existing `ToolInvocation[]` projection.

Patterns:

- **Projection** — raw `ClientEvent[]` is first projected into `ToolInvocation[]` by `Timeline.projectInvocations`.
- **Query model** — a separate `EventFilter` component turns a `FilterState` + `SortState` + search string into a filtered, sorted `ToolInvocation[]`.
- **Command/Query separation** — `app.js` owns mutable UI state; `EventFilter` is pure and testable.
- **Strategy** — sort comparators and filter predicates are swappable by field.
- **Observer** — keyboard events and filter input changes dispatch state mutations and re-render the active view.
- **Flyweight DOM** — toolbar is rendered once; only the list content re-renders on filter/sort changes.

## Directory structure

```
servers/dashboard/
├── public/
│   ├── index.html                       # + toolbar container, filter panel, export controls
│   ├── styles.css                       # + toolbar, scroll containers, responsive rules
│   ├── app.js                           # + filter/sort state, keyboard handlers, export wiring
│   └── components/
│       ├── shared.js                    # existing helpers (no changes expected)
│       ├── timeline.js                  # renderTimeline accepts optional filtered invocations
│       ├── fileActivity.js              # buildFileActivity accepts optional filtered invocations
│       ├── networkGraph.js              # unchanged
│       ├── eventFilter.js               # NEW: pure filter/sort/search engine
│       ├── exportController.js          # NEW: JSON/CSV generation
│       └── toolbar.js                   # NEW: toolbar DOM builder and event wiring
├── src/
│   ├── types.ts                         # unchanged
│   ├── state.ts                         # unchanged
│   ├── presenter.ts                     # unchanged
│   └── tests/
│       ├── dashboard-components.test.ts # + filter/sort/export tests
│       └── sanitize.test.ts             # unchanged
```

## Data contracts

### ToolInvocation (existing, unchanged)

```typescript
interface ToolInvocation {
  id: string;
  tool: string;
  eventType: string;
  status: 'running' | 'success' | 'error' | string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  detail?: string;
  skill?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  meta?: boolean;
}
```

### FilterState

```typescript
interface FilterState {
  status: Set<'running' | 'success' | 'error'>;   // empty = all
  toolTypes: Set<string>;                           // empty = all
  skills: Set<string>;                              // empty = all
  timeRange: 'all' | '1m' | '5m' | '15m' | '1h';   // window ending at now
}
```

Rules:

- `status`, `toolTypes`, and `skills` are sets of allowed values. An empty set means "no restriction".
- `timeRange` is a predefined relative window. `all` disables the time filter.
- Skill values are derived from the current session's events, not a hard-coded list.

### SortState

```typescript
interface SortState {
  field: 'time' | 'status' | 'type' | 'skill';
  direction: 'asc' | 'desc';
}
```

Rules:

- `time` sorts by `startTime`.
- `status` sorts lexicographically by `status`.
- `type` sorts by `tool` name.
- `skill` sorts by `skill` name, with empty values last.
- For equal values, fall back to `startTime` descending (newest first) to keep a stable, predictable order.

### Search contract

```typescript
type SearchScope = 'all' | 'tool' | 'detail' | 'skill' | 'path' | 'snippet';

interface SearchState {
  query: string;
  scope: SearchScope;
}
```

Rules:

- Search is case-insensitive and token-based (every whitespace-separated token must match somewhere).
- Default scope is `all`.
- `tool` matches `inv.tool`.
- `detail` matches `inv.detail`.
- `skill` matches `inv.skill`.
- `path` matches any path resolved from `inv.input`/`inv.output` via `Shared.resolvePath`.
- `snippet` matches `output.diff`, `output.contentSnippet`, or stringified `output`/`input` after escaping.
- An empty query matches everything.

### EventFilter public API

```typescript
interface EventFilter {
  filterAndSort(
    invocations: ToolInvocation[],
    search: SearchState,
    filters: FilterState,
    sort: SortState,
    now: number
  ): ToolInvocation[];

  buildFilterOptions(invocations: ToolInvocation[]): {
    tools: string[];
    skills: string[];
    statuses: ('running' | 'success' | 'error')[];
  };

  matchesSearch(inv: ToolInvocation, search: SearchState, shared: SharedAPI): boolean;
  matchesFilters(inv: ToolInvocation, filters: FilterState, now: number): boolean;
  compareInvocations(a: ToolInvocation, b: ToolInvocation, sort: SortState): number;
}
```

Implementation notes (no code):

- `filterAndSort` first filters by search + filters, then sorts.
- `buildFilterOptions` scans the full, unfiltered invocation list so the UI can show checkboxes for every observed tool and skill.
- All functions are pure; they must not mutate inputs.

### ExportController public API

```typescript
interface ExportController {
  asJson(invocations: ToolInvocation[], shared: SharedAPI): Blob;
  asCsv(invocations: ToolInvocation[], shared: SharedAPI): Blob;
  download(blob: Blob, filename: string): void;
}
```

Rules:

- JSON export contains an array of objects with fields: `id`, `tool`, `status`, `startTime`, `endTime`, `durationMs`, `detail`, `skill`, `path`.
- CSV export contains a header row and one data row per invocation. Values containing commas, quotes, or newlines are wrapped in double quotes and escaped per RFC 4180.
- `path` is resolved with `Shared.resolvePath` if available; otherwise omitted.
- Long `detail`, `input`, and `output` fields are not exported raw; only the sanitized scalar summary fields above are included.
- Filenames include an ISO timestamp, e.g. `crewloop-events-2026-06-26T170000.json`.

### Toolbar public API

```typescript
interface ToolbarOptions {
  search: SearchState;
  filters: FilterState;
  sort: SortState;
  filterOptions: ReturnType<EventFilter['buildFilterOptions']>;
  expanded: boolean; // is filter panel open
  onSearch(query: string): void;
  onSearchScope(scope: SearchScope): void;
  onToggleFilterPanel(): void;
  onStatusChange(status: string, checked: boolean): void;
  onToolTypeChange(tool: string, checked: boolean): void;
  onSkillChange(skill: string, checked: boolean): void;
  onTimeRangeChange(range: FilterState['timeRange']): void;
  onSortChange(field: SortState['field'], direction: SortState['direction']): void;
  onExportJson(): void;
  onExportCsv(): void;
  onClear(): void;
}

interface ToolbarRenderer {
  render(container: HTMLElement, options: ToolbarOptions): void;
  destroy(): void;
}
```

Rules:

- The toolbar is rendered once inside `index.html`; subsequent state changes update DOM inputs in place rather than rebuilding the whole toolbar.
- Inputs are debounced in `app.js`, not inside the toolbar component.

## Flows

### Initial load

1. `app.js` connects to the WebSocket.
2. Snapshot arrives; `app.js` stores `sessions`.
3. `app.js` reads persisted filter/sort/search state from `sessionStorage` (optional, best-effort).
4. `app.js` calls `EventFilter.buildFilterOptions` on the full invocation list.
5. `Toolbar.render` builds the toolbar DOM and populates filter checkboxes.
6. `app.js` renders the active view using filtered/sorted invocations.

### Live update

1. WebSocket `update` arrives.
2. `app.js` updates `state.sessions` (or queues if the timeline is paused).
3. `app.js` calls `EventFilter.buildFilterOptions` on the new full invocation list and refreshes toolbar option lists without losing current selections.
4. `app.js` calls `EventFilter.filterAndSort` with current search/filters/sort.
5. The active view renderer receives the filtered list and re-renders, preserving scroll position.

### Search interaction

1. User types in the search input.
2. `app.js` debounces input (e.g. 150ms) and updates `state.search.query`.
3. `app.js` re-runs `filterAndSort` and re-renders the active view.
4. The toolbar shows a result count and a clear button.

### Filter interaction

1. User opens the filter panel and checks/unchecks a value.
2. `app.js` updates `state.filters` (status/toolTypes/skills) or `state.filters.timeRange`.
3. `app.js` re-runs `filterAndSort` and re-renders.
4. The export buttons always reflect the currently visible set.

### Sort interaction

1. User picks a sort field/direction from the dropdown.
2. `app.js` updates `state.sort`.
3. `app.js` re-runs `filterAndSort` and re-renders.

### Export interaction

1. User clicks JSON or CSV button.
2. `app.js` calls `ExportController.asJson`/`asCsv` with the current filtered invocation list.
3. `ExportController.download` creates an object URL, clicks a transient `<a>`, and revokes the URL.

### Keyboard shortcuts

| Key | Action | Notes |
|-----|--------|-------|
| `/` | Focus search input | Prevent default if not in an input |
| `1` | Switch to Timeline tab | |
| `2` | Switch to Network tab | |
| `3` | Switch to Files tab | |
| `Esc` | Clear search, filters, and sort to defaults | Blur active input if any |
| `?` | Show a small shortcut cheatsheet tooltip | Optional; can be deferred |

Rules:

- Shortcuts are ignored when focus is inside a text input, textarea, or contenteditable element.
- `app.js` binds `keydown` on `document` and mutates `state` accordingly, then calls existing render functions.

## UI layout changes

`index.html` adds a toolbar inside the timeline/files panel, above the tab bar:

```html
<section class="panel timeline-panel">
  <div class="dashboard-toolbar" id="dashboard-toolbar">
    <!-- rendered by Toolbar component -->
  </div>
  <div class="view-tabs" id="view-tabs">...</div>
  <div class="view-panels">...</div>
</section>
```

Toolbar structure (semantic):

```html
<div class="toolbar-row">
  <div class="toolbar-search">
    <i class="ph ph-magnifying-glass"></i>
    <input type="search" placeholder="Search events..." aria-label="Search events" />
    <select aria-label="Search scope">
      <option value="all">All</option>
      <option value="tool">Tool</option>
      <option value="detail">Detail</option>
      <option value="skill">Skill</option>
      <option value="path">Path</option>
      <option value="snippet">Snippet</option>
    </select>
  </div>
  <button class="toolbar-button" data-action="toggle-filters">Filters</button>
  <select class="toolbar-sort" aria-label="Sort by">
    <optgroup label="Sort">
      <option value="time-desc">Newest first</option>
      <option value="time-asc">Oldest first</option>
      <option value="status-asc">Status</option>
      <option value="type-asc">Type</option>
      <option value="skill-asc">Skill</option>
    </optgroup>
  </select>
  <button class="toolbar-button" data-action="export-json">JSON</button>
  <button class="toolbar-button" data-action="export-csv">CSV</button>
  <button class="toolbar-button" data-action="clear" aria-label="Clear filters">Clear</button>
</div>
<div class="toolbar-filters" id="toolbar-filters" hidden>
  <fieldset class="filter-group"><legend>Status</legend>...</fieldset>
  <fieldset class="filter-group"><legend>Tool type</legend>...</fieldset>
  <fieldset class="filter-group"><legend>Skill</legend>...</fieldset>
  <fieldset class="filter-group"><legend>Time range</legend>...</fieldset>
</div>
<div class="toolbar-meta">
  <span class="result-count">24 events</span>
  <span class="shortcut-hint">Press / to search</span>
</div>
```

## CSS contracts

New classes (no implementation values required here, but names are contract):

- `.dashboard-toolbar` — toolbar root.
- `.toolbar-row` — primary controls row.
- `.toolbar-search` — search input wrapper.
- `.toolbar-button` — icon/text buttons.
- `.toolbar-sort` — sort dropdown.
- `.toolbar-filters` — collapsible filter panel.
- `.filter-group` — fieldset grouping.
- `.filter-chip` — individual checkbox + label.
- `.toolbar-meta` — result count and shortcut hints.
- `.result-count`, `.shortcut-hint`.
- `.view-panel` already exists; ensure each active panel uses `overflow: hidden` and a child scroll container.
- `.timeline` must keep `overflow-y: auto` and a stable `flex: 1`.
- `.files-viewport` already uses flex; add responsive stacking classes.
- `.panel-scroll-container` — generic utility for bounded vertical scroll inside a flex item.

Responsive behavior:

- **Desktop (≥1024px):** toolbar row is horizontal; filter panel is a multi-column grid; Files view keeps side-by-side list + detail.
- **Tablet (768–1023px):** toolbar wraps into two rows; filter panel is a two-column grid; Files list/detail still side-by-side but list width reduces to 220px.
- **Small (<768px):** toolbar stacks vertically; filter panel is single column; Files view becomes drill-in: list full width, detail replaces list when a file is selected, with a back button.
- Ensure no horizontal scroll on the main viewport at any width; only internal panels scroll vertically.

## State additions in app.js

```typescript
interface DashboardState {
  // existing fields
  sessions: Map<string, Session>;
  activeSessionId: string | null;
  selectedSessionId: string | null;
  theme: string;
  connection: string;
  // ...

  // new fields
  search: SearchState;
  filters: FilterState;
  sort: SortState;
  toolbarExpanded: boolean;
}
```

Default state:

- `search.query = ''`, `search.scope = 'all'`.
- `filters.status = new Set()`, `filters.toolTypes = new Set()`, `filters.skills = new Set()`, `filters.timeRange = 'all'`.
- `sort.field = 'time'`, `sort.direction = 'desc'` (newest first).
- `toolbarExpanded = false`.

## Backend changes

None. The WebSocket contract stays identical. The sanitizer already strips dangerous content; exports only include already-sanitized scalar fields.

## Testing plan

- **Unit:** `EventFilter.filterAndSort` returns correct subsets for combined status + tool + skill + time filters.
- **Unit:** `EventFilter.matchesSearch` matches by every scope and ignores case.
- **Unit:** `EventFilter.compareInvocations` sorts correctly by each field and falls back to time descending.
- **Unit:** `EventFilter.buildFilterOptions` returns distinct sorted tools/skills/statuses.
- **Unit:** `ExportController.asCsv` produces valid RFC 4180 rows with quoted values.
- **Unit:** `ExportController.asJson` produces a JSON array with the expected scalar shape.
- **Integration:** `app.js` state mutations after keyboard events result in the correct active view/tab.
- **Manual:** run a live agent session, type in search, toggle filters, change sort, export JSON/CSV, resize browser, and use keyboard shortcuts.

## Risks and trade-offs

- **Performance:** filtering/sorting on every keystroke over many events could jank. Mitigation: debounce search; keep projection + filter pure and allocation-light; cap max invocations at the existing `MAX_EVENTS`.
- **State loss on reload:** filter state is ephemeral. Mitigation: optionally persist to `sessionStorage` so a reload restores the last query.
- **CSV escaping:** home-grown CSV generation can mishandle edge cases. Mitigation: test against quoted fields and newlines; keep the schema narrow.
- **Responsive complexity:** adding a toolbar and filter panel increases CSS surface. Mitigation: use flexbox with `min-width: 0`; avoid fixed heights outside of the header.
- **Accessibility:** new controls must be keyboard-focusable and labeled. Mitigation: native inputs, `<label>` elements, `aria-label` on icon-only buttons, and visible focus outlines.
