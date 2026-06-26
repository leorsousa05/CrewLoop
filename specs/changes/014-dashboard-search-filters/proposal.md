# Proposal: Dashboard Search, Filters, Sorting, Export, and Keyboard Shortcuts

## WHY

The CrewLoop dashboard now presents a reverse-chronological timeline, a skill network graph, and a file-activity panel. During a busy agent session these views can grow quickly. Today the user has no way to narrow the timeline or file list, no full-text search, no sorting options, no way to extract the visible data, and no keyboard-driven navigation. On smaller viewports the panels also feel cramped because the layout was designed for a wide desktop screen.

This change aims to:

1. Keep the Timeline and Files panels self-contained with internal scrolling so the rest of the UI stays stable.
2. Let the user search across tools, details, skills, file paths, and content snippets from a single input.
3. Provide fast filters for status, tool type, active skill, and time window.
4. Allow sorting by time, status, tool type, and skill.
5. Export the currently visible events as JSON or CSV for offline analysis or bug reports.
6. Add keyboard shortcuts for common actions (focus search, switch tabs, clear filters).
7. Improve the responsive layout so the dashboard remains usable on tablets and small laptops.

## Scope

### In scope

- A shared toolbar above the Timeline and Files views containing:
  - Full-text search input.
  - Collapsible filter panel (status, tool type, skill, time range).
  - Sort dropdown.
  - Export buttons (JSON, CSV).
- Internal, bounded scrolling for the Timeline list and Files list/detail panes.
- Pure client-side filtering, sorting, and search over the existing `ToolInvocation[]` projection.
- A small `EventFilter` component with deterministic, testable functions.
- A small `ExportController` component to generate downloadable JSON/CSV blobs.
- Keyboard shortcuts wired in `app.js`.
- Responsive CSS adjustments for medium and small screens.
- Unit tests for the filter/sort engine and export helpers.

### Out of scope (deferred)

- Server-side indexing, pagination, or query API.
- Advanced query language (regex, boolean operators, saved filters).
- Filtering or searching the Network graph.
- Historical search across archived sessions.
- CSV column customization or JSON schema versioning.
- A separate mobile redesign; this is a layout-hardening pass only.

## Constraints

- Stay on the vanilla HTML/CSS/JS stack. No React, Vue, charting libraries, or data-grid dependencies.
- Reuse existing CSS variables and design tokens; add new tokens only when necessary.
- Respect `prefers-reduced-motion` for any new transitions.
- Do not change the WebSocket event contract; all filtering happens in the browser.
- Keep sanitization rules unchanged; never expose raw tool input/output in exports.
- Maintain the existing tab navigation and hover-pause behavior.

## Success criteria

- The Timeline and Files panels scroll independently and never push the viewport height to grow.
- Typing in the search box narrows rows in both Timeline and Files views in real time.
- Status, tool-type, skill, and time-range filters reduce the visible rows.
- Sorting changes the row order immediately and works for time, status, type, and skill.
- JSON and CSV exports contain exactly the visible, filtered rows.
- Keyboard shortcuts focus search (`/`), switch tabs (`1/2/3`), and clear filters (`Esc`).
- The layout is usable without horizontal scrolling down to 768px width.
- All existing dashboard tests continue to pass; new tests cover the filter engine and exports.
