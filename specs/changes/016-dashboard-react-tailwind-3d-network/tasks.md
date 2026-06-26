# Tasks: Dashboard React + Tailwind + 3D Network Rewrite

## Preparation

- [x] Read the existing dashboard code (server, public components, package.json, README).
- [x] Create spec 016 folder and files (this spec).
- [x] Decide final 3D graph library and confirm it installs cleanly on Windows/Git Bash.

## Setup

- [x] Initialize `servers/dashboard/ui/` with Vite + React + TypeScript template.
- [x] Install runtime dependencies: `react`, `react-dom`, `react-force-graph-3d`, `@phosphor-icons/react`.
- [x] Install dev dependencies: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `@types/react`, `@types/react-dom`.
- [x] Configure `tailwind.config.js` with custom colors mapped to CSS variables.
- [x] Configure `postcss.config.js` and `vite.config.ts` (build outDir `dist/public`, dev proxy to backend).
- [x] Add `ui/src/styles/index.css` with Tailwind directives and CSS variable tokens.
- [x] Create `ui/index.html` with Google Fonts, Phosphor script, and root div.

## Shared helpers

- [x] Port `format.ts` (duration, time, escapeHtml, truncate, prettyJson).
- [x] Port `paths.ts` (resolvePath including operations[] and camelCase).
- [x] Port `invocations.ts` (`projectInvocations`, `buildFileActivity`).
- [x] Create `graph.ts` (`buildGraph3D`).
- [x] Create `constants.ts` (skill icons, source icons, node colors).
- [x] Add Node tests for the new pure helpers under `servers/dashboard/src/lib/*.test.ts` runnable by Node.

## React hooks

- [x] Implement `useWebSocket` with reconnect, ping/pong, and message parsing.
- [x] Implement `useSessions` to merge snapshots/updates and track active session.
- [x] Implement `useTheme` with localStorage persistence and system preference fallback.

## React components

- [x] `App.tsx` — layout, state, WebSocket wiring, hover-pause queue.
- [x] `Header.tsx` + `SessionSelector.tsx` — brand, theme toggle, session dropdown.
- [x] `ActiveSkillPanel.tsx` — lifecycle strip, skill icon/name, status/confidence/source.
- [x] `TelemetryPanel.tsx` — tool count, duration, event rate.
- [x] `ActivityGraph.tsx` — canvas bar chart.
- [x] `ViewTabs.tsx` — Timeline / Network / Files.
- [x] `Timeline.tsx` + `TimelineRow.tsx` — scrollable, expandable, hover-pause.
- [x] `Network3D.tsx` + detail overlay — interactive 3D graph and detail panel.
- [x] `FileActivity.tsx` + `FileList.tsx` + `FileDiff.tsx` — two-pane file viewer.

## Server and build integration

- [x] Update `servers/dashboard/src/server.ts` to serve static files from `dist/public`.
- [x] Update `servers/dashboard/package.json` scripts and dependencies.
- [x] Remove old `public/app.js`, `public/styles.css`, `public/components/*`.
- [x] Replace `public/index.html` with the Vite entry.
- [x] Update `servers/dashboard/README.md` with new build/dev instructions.
- [x] Ensure `npm run build` compiles server and UI in one command.
- [x] Ensure `npm run typecheck` covers both server and UI.

## Verification

- [x] `npm install` succeeds in `servers/dashboard`.
- [x] `npm run build` succeeds.
- [x] `npm test` passes.
- [x] `CREWLOOP_DASHBOARD_PORT=7890 node dist/index.js` serves the new UI.
- [x] Browser loads `http://127.0.0.1:7890/` and WebSocket connects.
- [x] Live agent session populates Timeline, Network, and Files tabs.
- [x] Theme toggle works and persists.
- [x] Hover pause on Timeline queues updates correctly.
- [x] 3D graph can be orbited, nodes hovered/clicked, and details shown.
- [x] Reduced-motion preference disables 3D auto-rotation.

## Shipping

- [ ] Update `specs/living/dashboard/spec.md` to reflect the React stack and 3D network view.
- [ ] Move this spec to `specs/archive/` and mark complete.
- [ ] Hand off to Shipper for branch, commit, push, and PR.
