# Tasks: Dashboard Developer-Console Redesign

## Setup
- [x] Create spec folder structure
- [x] Initialize `.spec.yaml`

## Phase 0 — Revert spec 020 (prerequisite, atomic)
- [x] `git restore servers/dashboard/src/server.ts servers/dashboard/ui/src/App.tsx servers/dashboard/ui/src/components/Sidebar.tsx servers/dashboard/ui/src/components/TopBar.tsx servers/dashboard/ui/src/lib/tree.test.ts servers/dashboard/ui/src/lib/types.ts servers/dashboard/ui/src/styles/index.css`
- [x] Delete `servers/dashboard/src/api/cli.ts`
- [x] Delete `servers/dashboard/ui/src/components/CLIConfigPanel.tsx`
- [x] Update `specs/changes/020-dashboard-redesign/.spec.yaml`: `status: cancelled`, add `superseded_by: 021-dashboard-console-redesign`, note that implementation was reverted (recoverable from git history)
- [x] Move spec 020 folder to `specs/archive/2026-07-14-020-dashboard-redesign/`
- [x] Verify clean baseline: `npm run build` and `npm test` pass in `servers/dashboard/`

## Phase 1 — Design spec (Designer)
- [x] Produce `design-ui.md` in this spec folder: aesthetic direction (developer console / minimalist), token table (dark + light), type scale, spacing/radius/shadow tokens, per-component specs for shell + 7 views, motion table, responsive rules, accessibility checklist
- [x] Confirm token vocabulary against `design.md` API Contracts (rename/add only with atomic mapping)

## Phase 2 — Tokens (Engineer)
- [x] Rewrite token values in `ui/src/styles/index.css` for `:root` (dark) and `html.light` per `design-ui.md`
- [x] Update `.panel`, density variants, focus ring, scrollbar, keyframes, reduced-motion block to match
- [x] Register any new/renamed tokens in the Tailwind config
- [x] Smoke-test in browser: app renders, theme toggle and density toggle work

## Phase 3 — Shell (Engineer)
- [x] Restyle `TopBar.tsx`
- [x] Restyle `Sidebar.tsx` (desktop, tablet rail, mobile drawer)
- [x] Restyle `CommandPalette.tsx` (trigger + modal + rows)
- [x] Restyle `ViewHeader.tsx`, `FilterBar.tsx`, `SessionSelector.tsx`
- [x] Verify: navigation, ⌘K palette, theme/density toggles, session selector — dark + light

## Phase 4 — Views (Engineer, one commitable unit per view)
- [ ] Restyle `Overview.tsx` (+ `ActiveSkillPanel`, `TelemetryPanel`, `ActivityGraph`)
- [ ] Restyle `SessionsView.tsx` (+ `SessionSelector` integration, `ui/StatusBadge`)
- [ ] Restyle `TimelineView.tsx` (+ `Timeline`, `TimelineRow`)
- [ ] Restyle `NetworkView.tsx` (+ `Network3D` canvas token colors)
- [ ] Restyle `FilesView.tsx` (+ `FileList`, `FileDiff`, `FileActivity`)
- [ ] Restyle `SkillsView.tsx`
- [ ] Restyle `SettingsView.tsx`
- [ ] Per view: verify dark + light + compact density + reduced motion against `design-ui.md` checklist

## Testing
- [ ] All existing unit tests pass unchanged (`ui/src/lib/*.test.ts` and server tests)
- [ ] Manual per-view checklist from `design-ui.md` (contrast, focus states, touch targets, responsive breakpoints)
- [ ] Edge case: empty state (no sessions) renders correctly in every restyled view
- [ ] Edge case: light mode contrast for accent and semantic colors

## Verification
- [ ] `npm run build` in `servers/dashboard/`
- [ ] `npm test` in `servers/dashboard/`
- [ ] `npm run dev` — manual walkthrough of all 7 views, both themes, both densities, mobile drawer
- [ ] Capture after-screenshot for `assets/screenshots/dashboard-overview.png` (replaces stale pre-020 image)
- [ ] `git diff` review: no changes outside affected_files in `.spec.yaml`

## Documentation
- [ ] Update `specs/living/dashboard/spec.md` with the new design system summary
- [ ] Update `servers/dashboard/README.md` only if setup/usage changed (expected: no)

## Completion
- [ ] Update `.spec.yaml` status to completed
- [ ] Archive change folder to `specs/archive/`
