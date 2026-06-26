# Tasks: Dashboard Vercel-Style Command Center

## Preparation

- [x] Read spec 016 design and current `servers/dashboard/ui/src/` code.
- [x] Read this spec and the Designer skill if visual direction is required.
- [x] Confirm no server changes are needed.
- [x] Create the spec folder and files (this spec).

## Design (Designer)

- [x] Produce `design-ui.md` with Vercel-style tokens: sidebar width, top bar height, color usage, typography, spacing, iconography, motion, responsive breakpoints.
- [x] Define exact Tailwind class conventions for density (`compact`/`comfortable`).
- [x] Provide keyboard shortcut and command palette interaction specs.

## Shared state and helpers

- [x] Create `ui/src/lib/types.ts` with local `View`, `FilterState`, `DashboardSettings`, `PinnedSession`, `CommandPaletteItem`, and helper return types.
- [x] Create `ui/src/lib/settings.ts` with defaults, schema, localStorage key, and `migrate()`.
- [x] Create `ui/src/lib/search.ts` with `score()`, `search()`, and `matchesInvocation()`.
- [x] Create `ui/src/lib/filter.ts` with `buildOptions()`, `filterInvocations()`, `filterSessions()`, and `filterGraph()`.
- [x] Create `ui/src/lib/export.ts` with `toJson()`, `download()`, and `filename()`.
- [x] Add Vitest tests for `search.ts`, `filter.ts`, `export.ts`, and `settings.ts`.

## Contexts and hooks

- [x] Create `ui/src/contexts/SettingsContext.tsx` and `ui/src/hooks/useSettings.ts`.
- [x] Create `ui/src/contexts/PinnedSessionsContext.tsx` and `ui/src/hooks/usePinnedSessions.ts`.
- [x] Create `ui/src/contexts/FilterContext.tsx` and `ui/src/hooks/useFilters.ts`.
- [x] Create `ui/src/hooks/useKeyboardShortcut.ts`.
- [x] Create `ui/src/hooks/useCommandPalette.ts`.
- [x] Sort sessions with pins first at the App level.

## Chrome components

- [x] Create `ui/src/components/TopBar.tsx` (brand, command palette trigger, status, theme toggle).
- [x] Create `ui/src/components/Sidebar.tsx` (persistent navigation for seven views).
- [x] Create `ui/src/components/CommandPalette.tsx` (modal, focus management, fuzzy list).
- [x] Create `ui/src/components/FilterBar.tsx` (shared filter controls).
- [x] Create `ui/src/components/ViewHeader.tsx` (view title + actions).
- [x] Remove `ui/src/components/Header.tsx` and `ui/src/components/ViewTabs.tsx`.

## View components

- [x] Create `ui/src/components/views/Overview.tsx`.
- [x] Create `ui/src/components/views/SessionsView.tsx`.
- [x] Create `ui/src/components/views/TimelineView.tsx`.
- [x] Create `ui/src/components/views/NetworkView.tsx`.
- [x] Create `ui/src/components/views/FilesView.tsx`.
- [x] Create `ui/src/components/views/SkillsView.tsx`.
- [x] Create `ui/src/components/views/SettingsView.tsx`.

## Update existing components

- [x] Rewrite `ui/src/App.tsx` with new layout, providers, and view routing.
- [x] Update `Timeline.tsx` and `TimelineRow.tsx` to use filters, density, and copy action.
- [x] Update `Network3D.tsx` to accept and render a filtered graph.
- [x] Update `FileActivity.tsx` and `FileList.tsx` to use filters and density.
- [x] Pass pin-sorted sessions to `SessionSelector`.
- [x] Reuse `ActiveSkillPanel.tsx`, `TelemetryPanel.tsx`, and `ActivityGraph.tsx` in Overview.

## Styling

- [x] Update `ui/src/styles/index.css` with density tokens and layout utilities.
- [x] Apply Tailwind classes to new components per `design-ui.md`.
- [x] Verify responsive behavior at desktop widths (tablet/mobile follow design spec classes).

## Documentation

- [x] Update `servers/dashboard/README.md` with new views, command palette, shortcuts, filters, and settings.
- [x] Update `specs/living/dashboard/spec.md` after implementation and review.

## Verification

- [x] `npm install` succeeds in `servers/dashboard`.
- [x] `npm run typecheck` passes.
- [x] `npm run build` succeeds and outputs `dist/public/`.
- [x] `npm test` passes.
- [x] Server starts and UI loads at `http://127.0.0.1:7890/`.
- [x] All seven sidebar views render correctly.
- [x] Command palette opens with `Cmd/Ctrl+K` and navigates.
- [x] Filters update Timeline, Files, Sessions, Network, and Skills views.
- [x] Density toggle changes list row sizing.
- [x] Pinning sessions persists across reload.
- [x] Export JSON downloads filtered events.
- [x] Copy event copies JSON to clipboard.
- [x] Settings persist across reload.
- [x] Reduced motion disables animations.
- [x] Accessibility: tab order, ARIA labels, and focus states implemented.

## Shipping

- [x] Run reviewer skill.
- [x] Address review feedback.
- [x] Update `specs/living/dashboard/spec.md`.
- [ ] Move this spec to `specs/archive/` and mark complete.
- [ ] Hand off to Shipper for branch, commit, push, and PR.
