# Dashboard Spec Delta

## ADDED

### Backend contracts

- `DashboardEvent.input?: Record<string, unknown>` — sanitized tool input captured at event build time.
- `DashboardEvent.output?: Record<string, unknown>` — sanitized tool response captured at event build time.
- `ClientEvent.input?: Record<string, unknown>` — mirrored from `DashboardEvent` for the frontend.
- `ClientEvent.output?: Record<string, unknown>` — mirrored from `DashboardEvent` for the frontend.
- `sanitize()` return type extended with `input` and `output` safe summaries.

### Frontend components

- `Timeline` component (refactored from inline `renderTimeline`):
  - Chronological order (oldest top, newest bottom).
  - Auto-scroll to newest when not paused.
  - 1-second pause on mouse enter; flush pending events on mouse leave.
  - Expand/collapse full input/output on row click.
- `ToolInvocation` model derived from events:
  - One invocation per `tool_start`/`tool_end` pair.
  - Status transitions: `running` (blue) → `success` (green) / `error` (red).
- `NetworkGraph` component:
  - Canvas-based force-directed-ish node graph.
  - Nodes: active skill, tools, files.
  - Edges: skill → tool, tool → file.
- `FileActivity` component:
  - Lists read and edited files.
  - Shows diff/content when the tool response contains it.
- Navigation tabs in the main content area to switch between Timeline, Network, and Files views.

### Styles

- New timeline row states: `.timeline-item.running`, `.timeline-item.success`, `.timeline-item.error`.
- Expanded detail panel styles.
- Graph canvas container and legend styles.
- File list and diff block styles.

## MODIFIED

- `servers/dashboard/src/types.ts` — add optional `input`/`output` to `DashboardEvent` and `ClientEvent`.
- `servers/dashboard/src/filters/sanitize.ts` — return sanitized `input`/`output` summaries.
- `servers/dashboard/src/adapters/shim.ts` — pass raw input/output through `sanitize()` and attach results to the event.
- `servers/dashboard/src/presenter.ts` — include `input`/`output` in `presentEvent`.
- `servers/dashboard/public/app.js` — split monolithic renderer into focused components; update state handling for chronological timeline and pause queue.
- `servers/dashboard/public/index.html` — add view tabs and containers for network/files.
- `servers/dashboard/public/styles.css` — add new component styles and adjust timeline layout.

## MODIFIED (post-review)

- **Timeline order** — reverse chronological (newest at top, oldest below), matching the original dashboard behavior and reducing the need to scroll.
- **Auto-scroll** — disabled; the timeline stays at the user's current scroll position when new events arrive.
- **Network graph layout** — static after initial force simulation; no continuous `requestAnimationFrame` loop to avoid visual shaking.
- **Timeline expansion fallback** — when an event has no sanitized `input`/`output`, show "No details available" instead of an empty black panel.
- **File path extraction** — also checks nested `args.path` / `args.file_path` for sources that wrap tool arguments (e.g., AGY `toolCall.args`).

## REMOVED

- Reverse-chronological timeline rendering (initially reverted; now restored as the preferred order).
- Separate timeline rows for `tool_start` and `tool_end` of the same invocation.
- Continuous animation loop in the network graph.
