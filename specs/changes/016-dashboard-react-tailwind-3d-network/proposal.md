# Proposal: Dashboard React + Tailwind + 3D Network Rewrite

## WHY

The current CrewLoop dashboard is a vanilla-JS SPA that was assembled incrementally. The user has reported that "o que buga é tudo" — the 2D canvas network graph is static and fragile, the CSS is hard to extend, and adding the requested interactions (scrollable timeline, full details on click, hover pause, status color changes, graphical skill map) keeps piling on ad-hoc DOM code. The existing implementation is now a bigger maintenance risk than a rewrite.

This change rebuilds the entire dashboard frontend on a modern, maintainable stack:

1. **React + TypeScript** for a component-driven UI that matches how the rest of the CrewLoop tooling is evolving.
2. **Tailwind CSS** for a compact, theme-aware design system that supports dark/light mode without hundreds of custom CSS rules.
3. **Interactive 3D network graph** to replace the buggy 2D canvas implementation. Nodes (skill → tool → file) will be explorable, orbitable, and clickable.
4. **Preserve and polish the existing behavior**: reverse-chronological timeline with hover-pause, expandable event details, file list with diff viewer, telemetry cards, and session selector.

## Scope

### In scope

- Rewrite the dashboard UI in React + TypeScript under `servers/dashboard/ui/`.
- Style the UI with Tailwind CSS, preserving the dark aesthetic and adding a light theme.
- Replace the 2D canvas Network tab with an interactive 3D force-directed graph (`react-force-graph-3d`).
- Keep the existing server, WebSocket event contract, and source adapters unchanged.
- Replicate the current views:
  - Header with brand, theme toggle, and session selector.
  - Active skill panel with lifecycle accent strip, icon, name, status, confidence, and source.
  - Telemetry panel (tool count, duration, events/min).
  - Skill activity bar graph.
  - Timeline tab: reverse-chronological, scrollable, expandable rows, hover-pause, status color change.
  - Network tab: 3D skill/tool/file graph with hover highlights, click-to-focus, and a details panel.
  - Files tab: scrollable file list + diff/content snippet viewer.
- Add a Vite-based build pipeline that outputs the built UI to `dist/public/`.
- Update the server to serve static assets from `dist/public/`.
- Update `package.json` scripts so `npm run build` compiles both the server and the UI.
- Keep all existing server-side tests passing.

### Out of scope (deferred)

- Server-side rendering or code splitting.
- Search/filters toolbar (covered by spec 014; will be ported after this rewrite lands).
- Mobile-specific layout beyond basic responsiveness.
- Persisting UI state (theme is already persisted in `localStorage`).
- Rewriting the event ingestion, sanitization, or state store layers.

## Constraints

- The WebSocket event contract and `DashboardEvent` / `ClientSession` shapes must remain unchanged.
- The server-side TypeScript code must stay in `servers/dashboard/src/` and continue to compile with `tsc`.
- The dashboard must still be runnable with `CREWLOOP_DASHBOARD_PORT=7890 node servers/dashboard/dist/index.js` after a full build.
- The global `crewloop-shim` and `crewloop-dashboard` binaries must keep working after reinstall.
- Prefer small, pure helper modules that can be unit-tested independently of React rendering.
- Respect `prefers-reduced-motion`; disable continuous 3D animation and reduce transitions when set.
- Bundle size is acceptable for a local dev tool; avoid pulling in unused charting libraries.

## Success criteria

- `npm run build` completes without errors and produces both `servers/dashboard/dist/` (server) and `servers/dashboard/dist/public/` (UI).
- `npm test` passes (server-side tests unchanged or extended).
- The dashboard loads at `http://127.0.0.1:7890/` and connects to the WebSocket.
- Timeline behaves exactly like before: reverse order, scrollable, expandable details, hover pause, status color change.
- Files tab lists files and shows the latest non-empty diff or content snippet when a file is selected.
- Network tab renders a 3D interactive graph where skill/tool/file nodes can be hovered, clicked, and orbited.
- Theme toggle switches dark/light mode and persists the choice.
- The 3D graph degrades gracefully if WebGL is unavailable.
