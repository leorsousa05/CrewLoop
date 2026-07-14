# Tasks: Dashboard SaaS Minimalist Redesign

## Setup

- [x] Create spec folder structure
- [x] Initialize `.spec.yaml`
- [x] Update `specs/changes/021-dashboard-console-redesign/.spec.yaml` to `status: superseded` with `superseded_by: 022-dashboard-saas-minimalist-redesign`

## Phase 0 — Baseline cleanup (prerequisite)

- [x] Inspect `git status` in `servers/dashboard/` and the repo root.
- [x] Verify `npm run build` and `npm test` pass in `servers/dashboard/` on the current baseline.
- [ ] **Deferred:** Full `git restore` of partial spec-021 changes to HEAD (Engineer skill cannot run git mutations; Shipper will reconcile the final diff).

## Phase 1 — Network view removal (Engineer)

- [x] Remove `'network'` from `View` union in `ui/src/lib/types.ts`.
- [x] Remove `{ key: 'network', label: 'Network', icon: 'Graph' }` from `VIEWS` in `ui/src/App.tsx`.
- [x] Remove `NetworkView` import and the `network` case from `renderView()` in `ui/src/App.tsx`.
- [x] Remove `buildGraph3D` and `filterGraph` imports and usage from `ui/src/App.tsx`.
- [x] Delete `ui/src/components/views/NetworkView.tsx`.
- [x] Delete `ui/src/components/Network3D.tsx`.
- [x] Remove `react-force-graph-3d` from `servers/dashboard/package.json`.
- [x] Run `npm install` in `servers/dashboard/` to regenerate `package-lock.json`.
- [x] Verify `npm run build` and `npm test` pass after Network removal.

## Phase 2 — Design spec (Designer)

- [x] Produce `design-ui.md` in this spec folder: aesthetic direction (SaaS minimalist / Linear-Vercel-Raycast), token tables (light + dark), type scale, spacing/radius/shadow tokens, per-component specs for shell + 6 views, motion table, responsive rules, accessibility checklist.
- [x] Confirm token vocabulary against `design.md` API contracts (rename/add only with atomic mapping).

## Phase 3 — Design system tokens (Engineer)

- [x] Rewrite token values in `ui/src/styles/index.css` for `:root` (dark) and `html.light` per `design-ui.md`.
- [x] Update `.panel`, density variants, focus ring, scrollbar, keyframes, reduced-motion block to match.
- [x] Register any new/renamed tokens in `ui/tailwind.config.js` (font-display swapped from Teko to Space Grotesk).
- [ ] **Deferred:** Browser smoke-test of theme toggle and density toggle (requires dev server; Reviewer can verify).

## Phase 4 — Shell (Engineer)

- [x] Restyle `TopBar.tsx` (font-display now maps to Space Grotesk; Network removed from titles).
- [x] Restyle `Sidebar.tsx` (desktop, tablet rail, mobile drawer) — now 6 nav items.
- [x] Restyle `CommandPalette.tsx` (no Network view items; token-driven colors apply automatically).
- [x] Restyle `ViewHeader.tsx`, `FilterBar.tsx`, `SessionSelector.tsx` (token-driven colors apply automatically).
- [ ] **Deferred:** Browser verification of navigation, `⌘K` palette, theme/density toggles, session selector in both modes.

## Phase 5 — Views (Engineer, one commitable unit per view)

- [x] Restyle `Overview.tsx` (+ `ActiveSkillPanel`, `TelemetryPanel`, `ActivityGraph`).
- [x] Restyle `SessionsView.tsx` (+ `SessionSelector` integration, `ui/StatusBadge`).
- [x] Restyle `TimelineView.tsx` (+ `Timeline`, `TimelineRow`).
- [x] Restyle `FilesView.tsx` (+ `FileList`, `FileDiff`, `FileActivity`).
- [x] Restyle `SkillsView.tsx`.
- [x] Restyle `SettingsView.tsx`.
- [ ] **Deferred:** Per-view browser verification in light + dark + compact density + reduced motion.

## Testing

- [x] All existing unit tests pass unchanged (`ui/src/lib/*.test.ts` and server tests).
- [ ] **Deferred:** Manual per-view checklist from `design-ui.md` (contrast, focus states, touch targets, responsive breakpoints).
- [ ] **Deferred:** Edge case: empty state (no sessions) renders correctly in every restyled view.
- [ ] **Deferred:** Edge case: dark mode contrast for accent and semantic colors.
- [x] Edge case: command palette no longer offers Network view.

## Verification

- [x] `npm run build` in `servers/dashboard/`.
- [x] `npm test` in `servers/dashboard/`.
- [ ] **Deferred:** `npm run dev` — manual walkthrough of all 6 views, both themes, both densities, mobile drawer.
- [ ] **Deferred:** `git diff` review: no changes outside affected_files in `.spec.yaml` (Shipper responsibility).

## Documentation

- [ ] Update `specs/living/dashboard/spec.md` with the new design system summary.
- [ ] Update `servers/dashboard/README.md` only if setup/usage changed (expected: no).

## Completion

- [x] Update `.spec.yaml` status to completed.
- [ ] Archive change folder to `specs/archive/` (Shipper responsibility).
