# Spec Delta: Dashboard UI (Structure & Visual System)

## Current State

The dashboard (post-spec-022, uncommitted working tree) has six state-switched views — Overview, Sessions, Timeline, Files, Skills, Settings — with no router and no URL state. Navigation is defined twice (`VIEWS` in `App.tsx`, `ITEMS` in `Sidebar.tsx`). Every view renders a 40px `ViewHeader` title that duplicates the TopBar title. The Overview duplicates aggregate data owned by the Skills and Sessions views. Styling is token-driven via CSS custom properties in `ui/src/styles/index.css` mapped into `tailwind.config.js`, but font sizing is ad-hoc (`text-[40px]`, `text-6xl`, `text-[8px]`, …). Network-era dead code remains in `lib/filter.ts`, `lib/types.ts`, `lib/filter.test.ts`, `vite.config.ts`, and `hooks/useTheme.ts`.

## Changes

### ADDED

- `ui/src/lib/navigation.ts` — single navigation registry (`NAV_ITEMS`, `NavItem`, `getNavItem`) consumed by App, Sidebar, CommandPalette, and TopBar.
- `ui/src/lib/route.ts` — pure hash-route serialization: `parseRoute`, `serializeRoute`, `filtersToQuery`, `filtersFromQuery`, plus `RouteState` / `SerializedFilterState` types.
- `ui/src/lib/route.test.ts` — unit tests for route parsing/serialization round-trips and edge cases.
- `ui/src/lib/shortcuts.ts` — keyboard shortcut registry (`SHORTCUTS`, `Shortcut`, scopes) used by the global key handler and the Settings shortcuts section.
- `ui/src/hooks/useHashRoute.ts` — hashchange-driven hook owning URL state (`route`, `navigate(patch, mode)`).
- `ui/src/hooks/useResizeObserver.ts` — native ResizeObserver hook for canvas/containers.
- `ui/src/components/PauseBanner.tsx` — visible timeline pause indicator with buffered-event count and resume action.
- Hash-based deep-linking for view, selected session, filters, and selected file (`#/view?params`).
- Global keyboard shortcuts: digits 1–6 for views, `/` to focus filter search, `Esc` to close popovers/palette, `j`/`k`/`Enter`/`p` inside the timeline.
- Sessions sort control (recent / duration / events / name; pinned sessions always first), synced to the URL.
- Named type scale (display-2xl … micro) as CSS variables registered in `tailwind.config.js` `fontSize`.
- Keyboard shortcuts reference section in SettingsView.
- Accessibility: `role="tree"`/`treeitem`/`aria-expanded` on FileList, `aria-expanded` + focusable button rows on Timeline, `aria-label`/`sr-only` text on color-only status dots, arrow-key navigation in SessionSelector listbox.

### MODIFIED

- `ui/src/App.tsx` — rewired to `useHashRoute` (URL is the source of truth for view/session/filters/file); consumes `NAV_ITEMS`; lifts pause model to `{ hover, manual }` and passes `paused`/`bufferedCount` to TimelineView; registers global shortcuts.
- `ui/src/lib/types.ts` — remove `Graph3D` import and `filterGraph` from `FilterEngine`; add `RouteState`, `SerializedFilterState`, `SessionSortKey` (or re-export from `lib/route.ts`).
- `ui/src/lib/filter.ts` — remove `filterGraph`; add `sortSessions(sessions, key, pins, now)`.
- `ui/src/lib/filter.test.ts` — remove graph tests; add `sortSessions` tests.
- `ui/src/components/TopBar.tsx` — single view title location; connection indicator gets a dot-only mobile variant (never hidden); search button keeps ⌘K.
- `ui/src/components/Sidebar.tsx` — consumes `NAV_ITEMS`; shows shortcut hint per item in desktop mode.
- `ui/src/components/CommandPalette.tsx` — consumes `NAV_ITEMS`; filter reset behavior unified with sidebar navigation (both go through `navigate`).
- `ui/src/components/FilterBar.tsx` — `Esc` closes popovers; popovers anchor to the right edge when needed and become a full-width sheet below `sm`; Time filter uses radio semantics.
- `ui/src/components/SessionSelector.tsx` — arrow-key navigation in the listbox.
- `ui/src/components/ActiveSkillPanel.tsx` — recomposed as a compact "Now" strip (no `text-6xl` hero).
- `ui/src/components/TelemetryPanel.tsx` — denser metrics (tools, duration, rate/min, files touched, error count).
- `ui/src/components/ActivityGraph.tsx` — ResizeObserver-driven redraw; `aria-label` + visually-hidden summary.
- `ui/src/components/Timeline.tsx` — keyboard navigation (`j`/`k`/`Enter`), roving focus; integrates PauseBanner.
- `ui/src/components/TimelineRow.tsx` — row header becomes a real `<button>` with `aria-expanded`; fully keyboard-operable.
- `ui/src/components/FileList.tsx` — tree roles/aria; Phosphor caret icons replace `▼`/`▶`; Portuguese comment translated to English.
- `ui/src/components/FileDiff.tsx` — adapted to master-detail usage (back affordance slot on mobile).
- `ui/src/components/FileActivity.tsx` — split-pane on `md+`, drill-down below `md` driven by `selectedPath` from the route.
- `ui/src/components/views/Overview.tsx` — recomposed: Now strip, telemetry, activity graph, live timeline preview (last N events with "Open timeline" action), recent sessions strip. Removes Top Skills / Top Tools / session-counter duplication.
- `ui/src/components/views/SessionsView.tsx` — valid HTML rows (`div[role=button]` + real pin button), keyboard-operable, sort control wired to URL.
- `ui/src/components/views/TimelineView.tsx` — hosts PauseBanner and the manual pause toggle; receives `paused`/`bufferedCount` props.
- `ui/src/components/views/FilesView.tsx` — master-detail drill-down on mobile via `selectedPath` route param.
- `ui/src/components/views/SkillsView.tsx` — sole owner of aggregate skill/tool rankings; restyled per `design-ui.md`.
- `ui/src/components/views/SettingsView.tsx` — adds the keyboard shortcuts reference section.
- `ui/src/components/ui/Icon.tsx` — add icons required by new UI (sort, pause/resume, carets) if missing from the map.
- `ui/src/components/ui/StatusBadge.tsx` — accessible labeling for color-only indicators.
- `ui/src/styles/index.css` — type-scale variables, sheet/popover responsive styles, focus-visible consistency; token vocabulary otherwise unchanged.
- `ui/tailwind.config.js` — register named `fontSize` tokens mapped to CSS variables.
- `ui/vite.config.ts` — remove the `vendor-graph` manual chunk.

### REMOVED

- `ui/src/components/ViewHeader.tsx` — deleted; view title lives only in the TopBar.
- `ui/src/hooks/useTheme.ts` — deleted (no importers; SettingsContext owns theme).
- `filterGraph` (`ui/src/lib/filter.ts`), `Graph3D` import (`ui/src/lib/types.ts`), and the graph tests (`ui/src/lib/filter.test.ts`) — Network-era leftovers.
- `vendor-graph` manual chunk (`ui/vite.config.ts`) — references dependencies already removed from `package.json`.
- `VIEWS` array in `App.tsx` and `ITEMS` array in `Sidebar.tsx` — replaced by `NAV_ITEMS`.
- All arbitrary font-size utilities (`text-[40px]`, `text-6xl` hero, `text-[8px]`, `text-[8.5px]`, `text-[12.5px]`, `py-0.2`) — replaced by the named type scale.

## Migration Notes

- URLs become meaningful: `#/timeline?session=abc&q=build`. Old bookmarks had no hash state, so nothing breaks — the app hydrates defaults when the hash is empty or invalid.
- `FilterContext`, `SettingsContext`, and `PinnedSessionsContext` public APIs are unchanged; they are hydrated from the URL on load and written back on change.
- Any in-flight branch touching `ViewHeader`, `VIEWS`/`ITEMS`, or `filterGraph` must rebase onto this structure.

## Backward Compatibility

- **Data contracts:** unchanged — `ClientSession`, `ClientEvent`, `ToolInvocation`, filter semantics, settings schema, WebSocket protocol, and REST endpoints are untouched.
- **Visual/behavioral:** intentionally breaking — layout, navigation structure, and interaction model change. No public API is affected.
- **Tests:** existing unit tests stay green except the removed graph tests; new tests cover `route.ts` and `sortSessions`.
