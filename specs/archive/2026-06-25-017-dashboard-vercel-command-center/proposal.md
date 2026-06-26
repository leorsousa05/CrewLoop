# Proposal: Dashboard Vercel-Style Command Center

## WHY

The CrewLoop dashboard rebuilt in spec 016 works, but it is still a single-session, three-tab tool. The user asked to "reimaginar esse layout inteiro": a persistent sidebar, more views, a global command palette, advanced filters, richer actions, and a Vercel-style command-center aesthetic. The current header + sidebar + tab layout is too simple for the density of information the dashboard now carries.

This change transforms the dashboard into a full command center:

1. **Persistent sidebar navigation** with icons and labels for every major view.
2. **Top bar** with a global `Cmd/Ctrl+K` command palette, breadcrumbs, and connection/status indicators.
3. **Seven views** instead of three:
   - **Overview** — high-level health cards, active sessions, recent activity sparkline, top skills/tools.
   - **Sessions** — sortable, filterable, pinnable session list.
   - **Timeline** — existing reverse-chronological event stream, now with filters, export, and copy.
   - **Network** — existing interactive 3D skill/tool/file graph.
   - **Files** — existing two-pane file activity with filters.
   - **Skills** — aggregate skill usage across all visible sessions.
   - **Settings** — theme, density, reduced motion, auto-follow, and data preferences.
4. **Advanced filters** by source, skill, status, time window, tool name, and operation type.
5. **Extra actions** — export visible events as JSON, copy a single event to the clipboard, pin sessions to the top of the list, and toggle density (compact/comfortable).

The goal is a single, cohesive redesign delivered in one branch on top of the React stack from spec 016.

## Scope

### In scope

- Reorganize `App.tsx` into a Vercel-style layout:
  - Persistent left sidebar (`Sidebar`) with view navigation.
  - Top bar (`TopBar`) with brand, global search trigger, breadcrumbs, connection status, and theme toggle.
  - Main content area that renders the active view.
- Add new views and sub-components:
  - `Overview`, `SessionsView`, `TimelineView`, `NetworkView`, `FilesView`, `SkillsView`, `SettingsView`.
- Implement a global command palette (`CommandPalette`) triggered by `Cmd/Ctrl+K` and a search button.
- Implement a shared filter bar (`FilterBar`) and filter state hook (`useFilters`).
- Implement density toggle (`compact`/`comfortable`) that affects row padding and font size across lists.
- Implement session pinning with localStorage persistence.
- Implement event export (JSON) and event copy-to-clipboard from the timeline context menu / detail panel.
- Implement the Settings view with persisted preferences.
- Update existing `Timeline`, `Network3D`, and `FileActivity` components to consume shared filters and density context.
- Add pure helper modules for search, export, and filtering.
- Keep the WebSocket event contract, server code, and adapter behavior unchanged.
- Keep the React + Vite + Tailwind + `react-force-graph-3d` stack.
- Update `README.md` to document new views, shortcuts, and settings.

### Out of scope (deferred)

- Server-side search, indexing, or pagination.
- Backend API changes or new endpoints.
- User accounts, authentication, or multi-user state.
- Historical persistence of sessions beyond the server's in-memory store.
- CSV export (JSON only in this iteration; CSV can be added later).
- Real-time collaborative features.
- Mobile-specific native gestures beyond the existing responsive breakpoints.

## Constraints

- The WebSocket contract (`ClientSession`, `ClientEvent`, message types) must remain unchanged.
- The server (`servers/dashboard/src/`) must require no modifications beyond the existing static root from spec 016.
- All state must stay client-side; localStorage may be used only for user preferences (theme, density, pins, settings).
- Keep bundle size reasonable: no new heavy charting libraries. Use the existing canvas activity graph and `react-force-graph-3d`.
- Respect `prefers-reduced-motion` for animations and the 3D graph.
- Maintain accessibility: keyboard navigation, focus management in the command palette, ARIA labels, and visible focus rings.
- Follow the existing Tailwind design tokens; new tokens may be added only with Designer approval.
- Single delivery: one branch, one spec, one review cycle.

## Success criteria

- `npm run build` and `npm run typecheck` pass on Windows Git Bash.
- `npm test` passes (server tests unchanged; UI tests added/updated).
- The dashboard loads at `http://127.00.0.1:7890/` and connects via WebSocket.
- A persistent sidebar shows all seven views and highlights the active view.
- `Cmd/Ctrl+K` opens a command palette that can navigate to any view, session, skill, tool, file, or recent event.
- Filters can be applied by source, skill, status, time, tool, and operation type; results update immediately in Timeline, Files, Sessions, Network, and Skills views.
- The density toggle visibly changes row padding in lists.
- Sessions can be pinned and remain at the top of the session list across reloads.
- Individual timeline events can be copied to the clipboard.
- Visible events can be exported as a downloadable JSON file.
- Settings persist across reloads.
- Reduced-motion preference disables unnecessary animations.
