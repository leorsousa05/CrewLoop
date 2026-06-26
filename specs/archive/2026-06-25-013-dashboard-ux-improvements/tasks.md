# Tasks: Dashboard UX Improvements

## Backend / contracts

- [x] Extend `DashboardEvent` and `ClientEvent` types with optional `input` and `output` fields.
- [x] Update `sanitize()` to return sanitized `input` and `output` summaries.
- [x] Update `buildEvent()` in `shim.ts` to attach sanitized `input`/`output` to events.
- [x] Update `presentEvent()` to forward `input`/`output` to the client.
- [x] Add unit tests for sanitize input/output behavior.

## Frontend / shared

- [x] Create `public/components/shared.js` with `escapeHtml`, `formatTime`, `formatDuration`, `prefersReducedMotion`.
- [x] Refactor `app.js` to import shared helpers and delegate to view renderers.
- [x] Add view tabs to `index.html` and containers for Timeline / Network / Files.
- [x] Add CSS variables and classes for new row states, detail panels, graph, and file list.

## Timeline

- [x] Implement `ToolInvocation` projection from `ClientEvent[]`.
- [x] Render timeline in **reverse chronological order** (newest at top).
- [x] Disable auto-scroll; preserve user scroll position on updates.
- [x] Implement hover pause (paused while hovered) and pending-update flush on mouse leave.
- [x] Add status classes (running/success/error) with CSS transitions.
- [x] Implement click-to-expand detail panel showing sanitized input/output with empty-state fallback.
- [x] Add unit tests for projection.

## Network graph

- [x] Implement graph builder (nodes: skill/tool/file; edges: skill→tool, tool→file).
- [x] Implement canvas force-directed layout renderer with **static layout** after initial simulation.
- [x] Add responsive resize handling.
- [x] Add unit tests for graph builder.

## File activity

- [x] Implement file activity builder from `ToolInvocation[]` with path fallback (including nested `args`).
- [x] Render read and edited files with diff/content panels.
- [x] Add unit tests for file extraction.

## Integration and verification

- [x] Wire all views to tab navigation in `app.js`.
- [x] Run dashboard test suite and ensure 71+ tests pass.
- [x] Run a live agent session and manually verify timeline, network, and file views.
- [x] Update `specs/living/dashboard/spec.md` with the new contracts.
- [x] Move this spec to `specs/archive/` and mark complete.
