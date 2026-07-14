# Tasks: Dashboard Full Redesign — Structure & Visual System

## Setup

- [x] Create spec folder structure (`specs/changes/023-dashboard-full-redesign/`)
- [x] Initialize `.spec.yaml` (status: active, builds_on: 022)
- [x] Write `proposal.md`, `specs/ui/spec.md`, `design.md`, `tasks.md`
- [x] Record ADR `specs/decisions/003-dashboard-ui-navigation-model.md`

## Phase 0 — Baseline verification (Engineer)

- [x] Confirm `npm run build` and `npm test` pass in `servers/dashboard/` on the current working tree (spec-022 state is the baseline; do NOT revert it).
- [x] Confirm no uncommitted work outside the 022 file set will be disturbed.

## Phase 1 — Hygiene & dead code (Engineer)

- [x] Delete `ui/src/hooks/useTheme.ts`.
- [x] Remove `filterGraph` from `ui/src/lib/filter.ts`, the `Graph3D` import and `filterGraph` signature from `ui/src/lib/types.ts` `FilterEngine`.
- [x] Remove the graph tests from `ui/src/lib/filter.test.ts`.
- [x] Remove the `vendor-graph` manual chunk from `ui/vite.config.ts`.
- [x] Translate the Portuguese comment in `ui/src/components/FileList.tsx:76` to English.
- [x] Verify `npm run build` and `npm test` pass.

## Phase 2 — Design spec (Designer)

- [x] Produce `design-ui.md` in this spec folder: aesthetic direction (evolved SaaS minimalist), type-scale values for the 8 named tokens (light + dark), spacing/radius/shadow review, per-component visual specs for the recomposed shell + 6 views (incl. Now strip, PauseBanner, mobile drill-down, filter sheet), motion table, responsive rules, accessibility checklist.
- [x] Confirm the type-scale vocabulary and any token changes against `design.md` contracts (new tokens must be added atomically in `:root`, `html.light`, and `tailwind.config.js`).

## Phase 3 — Foundations (Engineer)

- [x] Create `ui/src/lib/navigation.ts` (`NavItem`, `NAV_ITEMS`, `getNavItem`) + registry invariant test.
- [x] Create `ui/src/lib/route.ts` (`RouteState`, `SerializedFilterState`, `parseRoute`, `serializeRoute`, `filtersToQuery`, `filtersFromQuery`, `DEFAULT_ROUTE`).
- [x] Create `ui/src/lib/route.test.ts` (round-trips, invalid input, enum validation).
- [x] Create `ui/src/lib/shortcuts.ts` (`SHORTCUTS` registry).
- [x] Create `ui/src/hooks/useHashRoute.ts` (`route`, `navigate(patch, mode)`, hashchange sync).
- [x] Create `ui/src/hooks/useResizeObserver.ts` (with no-RO fallback).
- [x] Add `sortSessions` to `ui/src/lib/filter.ts` + tests; add `SessionSortKey`, `RouteState`, `SerializedFilterState` to `ui/src/lib/types.ts`.
- [x] Register the 8 named `fontSize` tokens in `ui/tailwind.config.js` and the CSS variables in `ui/src/styles/index.css` (values from `design-ui.md`).
- [x] Verify `npm run build` and `npm test` pass (37 tests, 8 files).

## Phase 4 — Shell restructure (Engineer)

- [x] Rewire `App.tsx` to `useHashRoute`: hydrate contexts/selection from URL on mount; write through on change; remove the `VIEWS` array (consume `NAV_ITEMS`); lift pause model to `{ hover, manual }` and pass `paused`/`manualPaused`/`bufferedCount` to TimelineView.
- [x] Register global shortcuts in App (digits 1–6, `/`, `Esc`, input-focus guard).
- [x] `TopBar.tsx`: single view title (from `NAV_ITEMS`), connection indicator with dot-only mobile variant.
- [x] `Sidebar.tsx`: consume `NAV_ITEMS`, show shortcut hints in desktop mode, call `navigate`.
- [x] `CommandPalette.tsx`: consume `NAV_ITEMS`, unify navigation via `navigate` (filter reset consistent with sidebar).
- [x] Delete `ViewHeader.tsx` and remove all imports; views render their own toolbars where needed.
- [x] Verify `npm run build` and `npm test` pass. **Note:** phases 4–6 verified in a single build/typecheck/test run at the end, because shell and views share prop contracts (decision recorded in handoff notes).

## Phase 5 — Views restructure (Engineer, one unit per view)

- [x] `Overview.tsx`: recompose per `design-ui.md` — Now strip (`ActiveSkillPanel` compact), dense `TelemetryPanel`, `ActivityGraph`, live timeline preview (last 5 events + "Open timeline"), recent sessions strip. Removed Top Skills / Top Tools / session-counter panels; added zero-sessions empty state.
- [x] `SessionsView.tsx`: valid rows (`div[role=button]` + real pin button, keyboard-operable), sort control wired to `route.sort` (segmented control: Recent / Duration / Events / Name).
- [x] `TimelineView.tsx` + `Timeline.tsx` + `TimelineRow.tsx` + `PauseBanner.tsx`: visible pause banner with buffered count + resume, manual pause toggle (`p`), `j`/`k`/`Enter` keyboard navigation. **Deviation (approved by design constraint):** row is `div[role="button"][aria-expanded]`, not `<button>`, because the copy button is nested inside the row and nested buttons are invalid HTML.
- [x] `FilesView.tsx` + `FileActivity.tsx` + `FileDiff.tsx` + `FileList.tsx`: master-detail drill-down below `md` driven by `route.filePath`, back action (`md:hidden` CaretLeft button), tree roles/aria, caret icons.
- [x] `SkillsView.tsx`: sole owner of aggregate rankings; restyled with hairline stat strip and accent/running bars per `design-ui.md`.
- [x] `SettingsView.tsx`: added keyboard shortcuts reference section (from `SHORTCUTS`, grouped by scope); control rows stack on mobile (`flex-col sm:flex-row`).
- [x] Verify `npm run build` and `npm test` pass (single end-of-phase run, see Phase 4 note).

## Phase 6 — Responsive & accessibility pass (Engineer)

- [x] `FilterBar.tsx`: `Esc` closes popovers, right-edge anchoring (edge-flip via `getBoundingClientRect`), bottom sheet below `md` (scrim + `animate-sheet-in` + Done), radio semantics for Time (`role="radio" aria-checked`), search hint `.kbd` `/`.
- [x] `SessionSelector.tsx`: arrow-key navigation in the listbox (`activeIndex`, Enter selects, Esc closes, `aria-activedescendant`).
- [x] `ActivityGraph.tsx`: ResizeObserver redraw on `[session, size]`, `aria-label` + visually-hidden summary; grid lines removed per design.
- [x] `StatusBadge.tsx` and lifecycle dots: `aria-hidden` dots with adjacent status text (no color-only meaning).
- [x] Swept the diff for arbitrary font-size/padding utilities (`text-[…]`, `py-0.2`) and replaced with named tokens (`text-body`/`text-label`/`text-caption`/`text-micro`).
- [x] Icons present in `ui/Icon.tsx` (CaretLeft, CaretRight, ArrowsDownUp, Pause, Play, Pulse, TerminalWindow, Keyboard).
- [x] Verify `npm run build` and `npm test` pass (single end-of-phase run, see Phase 4 note).

## Phase 7 — Review compliance pass (Engineer, after Reviewer FAIL)

- [x] `PauseBanner.tsx`: removed the last arbitrary font-size (`!text-[12px]` → `!text-label`); dark-theme background now `--accent-dim` (light keeps `--accent-subtle`) via `.pause-banner` CSS class.
- [x] `Overview.tsx`: removed fixed `h-[240px]` panels (content-driven heights); live preview caps at 3 rows on mobile; recent sessions strip has `snap-x snap-mandatory` + `scrollbar-hide` + `snap-start` cards.
- [x] `App.tsx`: offline strip under TopBar ("Connection lost — reconnecting…") while status is `connecting`.
- [x] `FilterBar.tsx`: `Esc` closes the mobile filter sheet; scrim uses `--overlay` token; sheet capped at 70vh.
- [x] `TelemetryPanel.tsx`: mobile 2-col mini-grid (`grid-cols-2 md:grid-cols-5`), Errors spans full width when > 0.
- [x] `TimelineRow.tsx`: sr-only status text next to the dot; time column `w-20` with `text-micro`; 12px expand caret.
- [x] `SessionsView.tsx`: empty-filter state with "Nothing matches these filters" + ghost "Clear filters" action; pin affordance is now a star (`--warning` when pinned).
- [x] `SkillsView.tsx`: `animate-bar-in` on skill and tool bar fills.
- [x] `FileDiff.tsx`: error well restyled (`--error` left border, `--bg-inset`) with a "Retry" `btn-ghost` that refetches.
- [x] `ActivityGraph.tsx`: bar alpha 0.5 per design.
- [x] `TimelineView.tsx`: PauseBanner renders below the FilterBar toolbar.
- [x] `useKeyboardShortcut.ts`: modifier combos (⌘/Ctrl+K) now work from form fields; plain-key shortcuts remain guarded.
- [x] Root `package.json`: removed the leftover `react-force-graph-3d` dependency; lockfile regenerated (`grep` confirms zero references).
- [x] Verify `npm run build`, `npm run typecheck`, and `npm test` pass (37/37).

## Phase 8 — Directory entries bug fix (Engineer)

Bug: when the agent reads a directory, the Files view rendered the directory as a file (FileText icon, fetch of `/api/file-content` against a directory, and children hidden under a "file" node that never renders them).

- [x] `ui/src/lib/tree.test.ts`: added "promotes a file node to directory when it gains children" case (TDD — confirmed red before the fix).
- [x] `FileList.tsx` (`buildFileTree`): a node with children is always promoted to `directory`; leaf entries whose path is in `directoryPaths` render with the Folder icon (workspace tree and External Files list).
- [x] `FilesView.tsx`: computes `directoryPaths` via a `path + '/'` prefix heuristic over known workspace paths + file entries (useMemo), passed to `FileActivity`.
- [x] `FileActivity.tsx`: forwards `directoryPaths` to `FileList`; derives `isDirectory`/`childCount` for the selected entry and passes them to `FileDiff`.
- [x] `FileDiff.tsx`: new `isDirectory`/`childCount` props; skips the content/diff fetch for directories and renders a dedicated Directory state (Folder header, badge, child count) instead of the error well.
- [x] Scope stayed in `ui/` — no server contract changes (`src/` untouched).
- [x] Reviewer PASS (delta re-review); addressed the one non-blocking WARN: extracted the directory heuristic to `ui/src/lib/dirs.ts` (`computeDirectoryPaths`) — O(total path length) via ancestor-prefix lookup against a Set, replacing the O(n²) scan; covered by `ui/src/lib/dirs.test.ts` (6 cases, TDD red-first).
- [x] Verify `npm run build`, `npm run typecheck`, and `npm test` pass (44/44).

## Testing

- [x] New unit tests: `route.test.ts`, `sortSessions` tests, navigation registry invariants.
- [x] All pre-existing unit tests pass (minus removed graph tests) plus the new directory-promotion and `computeDirectoryPaths` cases: 44 tests, 9 files.
- [x] Also fixed a latent wrong relative import depth in `ui/src/lib/tree.test.ts` caught by `npm run typecheck`.
- [ ] **Deferred (Reviewer manual):** URL round-trip per view (refresh restores view/session/filters/file), back/forward between views, shortcut matrix, pause banner + resume, mobile drill-down, filter sheet, light + dark themes, both densities, reduced motion, empty-state (no sessions).

## Verification

- [x] `npm run build` in `servers/dashboard/` — passes.
- [x] `npm run typecheck` in `servers/dashboard/` — passes (added to the verification gate; UI type errors are invisible to `vite build`).
- [x] `npm test` in `servers/dashboard/` — 44/44 pass.
- [ ] **Deferred:** `npm run dev` manual walkthrough (Reviewer checklist above).
- [ ] **Deferred:** `git diff` review against `affected_files` (Shipper responsibility).

## Documentation

- [x] Update `specs/living/dashboard/spec.md` with the new IA, routing model, and type scale summary.
- [x] `servers/dashboard/README.md` — verified: no setup/usage change required (routes are hash-based and self-evident; dev workflow unchanged).
- [x] Root `AGENTS.md` — verified: repository structure unchanged (one file deleted, one hook deleted, new files within existing dirs).

## Completion

- [x] Update `.spec.yaml` status to completed.
- [ ] Archive change folder to `specs/archive/` (Shipper responsibility).
