# Dashboard Spec Delta

## ADDED

### Frontend components

- `EventFilter` component (`public/components/eventFilter.js`):
  - Pure functions for searching, filtering, and sorting `ToolInvocation[]`.
  - Supports combined status, tool-type, skill, and time-range filters.
  - Supports token-based, case-insensitive search across tool, detail, skill, path, and snippet.
  - Sorting by time, status, type, and skill with stable fallback.
  - Dynamic filter-option enumeration from the full invocation list.

- `ExportController` component (`public/components/exportController.js`):
  - JSON export of visible invocations.
  - RFC 4180 CSV export of visible invocations.
  - Transient download helper using object URLs.

- `Toolbar` component (`public/components/toolbar.js`):
  - Search input with scope selector.
  - Collapsible filter panel for status, tool type, skill, and time range.
  - Sort dropdown.
  - JSON/CSV export buttons.
  - Clear button and result count display.

### UI/Layout

- Toolbar container inside the main timeline/files panel, above the tab bar.
- Internal scrolling constraints on Timeline, Files list, and Files detail panes.
- Responsive toolbar and filter panel layouts for desktop, tablet, and small screens.
- Keyboard shortcut support (`/`, `1`, `2`, `3`, `Esc`).

### State

- `DashboardState.search: SearchState`.
- `DashboardState.filters: FilterState`.
- `DashboardState.sort: SortState`.
- `DashboardState.toolbarExpanded: boolean`.

## MODIFIED

- `servers/dashboard/public/index.html` — add toolbar container and ensure view panels have scrollable children.
- `servers/dashboard/public/app.js` — add filter/sort/search state, keyboard handler, debounced search, export wiring, and pass filtered invocations to view renderers.
- `servers/dashboard/public/components/timeline.js` — `renderTimeline` accepts an optional pre-filtered invocation list; if omitted, it projects and renders the full list as before (backward-compatible).
- `servers/dashboard/public/components/fileActivity.js` — `buildFileActivity` and `renderFileActivity` accept an optional pre-filtered invocation list.
- `servers/dashboard/public/styles.css` — add toolbar, filter panel, scroll containers, and responsive breakpoints.
- `servers/dashboard/src/tests/dashboard-components.test.ts` — add unit tests for `EventFilter` and `ExportController`.

## REMOVED

- Nothing. Existing behavior is preserved when no filter/search/sort is active.

## Backward compatibility

- The WebSocket event contract is unchanged.
- All new component APIs are additive with sensible defaults.
- When filter sets are empty and the search query is empty, `EventFilter.filterAndSort` returns the original invocation order, preserving the current timeline appearance.
