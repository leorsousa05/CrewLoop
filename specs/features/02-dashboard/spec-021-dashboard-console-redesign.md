# spec-021-dashboard-console-redesign

---
name: spec-021-dashboard-console-redesign
domain: 02-dashboard
status: completed
created: 2026-07-14
completed: 2026-07-14
supersedes: [spec-020-dashboard-redesign]
---

# Dashboard Developer-Console Redesign

## Objective

Revert the uncommitted spec-020 work cleanly, then deliver a full visual redesign of the dashboard shell and all 7 views with a developer-console / minimalist aesthetic — with zero behavioral regression.

## Context

- Dashboard architecture: `shared/architecture-overview.md` §Dashboard; ADR 001 (hybrid instrumentation), ADR 003 (hash navigation), ADR 005 (local trust).
- The committed baseline carried the amber Vercel command-center theme (spec 017) built incrementally; spacing, hierarchy, and density drifted across views.
- Spec 020 mixed a visual redesign (rejected blue theme) with a CLI management feature; both were uncommitted in a dirty working tree.

## Requirements

1. Revert spec 020 cleanly: restore the 7 modified files to HEAD, delete the 2 untracked implementation files, mark spec 020 cancelled/superseded, and move it to `specs/archive/`.
2. New design system (tokens, typography, spacing, motion) covering the app shell (`App`, `TopBar`, `Sidebar`, `CommandPalette`, `ViewHeader`, `FilterBar`, `SessionSelector`) and every view (`Overview`, `Sessions`, `Timeline`, `Network`, `Files`, `Skills`, `Settings`).
3. Aesthetic: dark-first, information-dense, monospace-driven, low ornamentation (developer console / minimalist).
4. Zero behavioral regression: no changes to `ClientSession`/`ClientEvent` contracts, contexts (`Settings`, `PinnedSessions`, `Filter`), hooks, or pure logic in `ui/src/lib/*`. All existing unit tests stay green.
5. Preserve density modes (`density-compact` / `density-comfortable`) and `prefers-reduced-motion`.
6. Dark mode primary; light mode keeps working via `html.light`.

## Behavior / Flow

1. Revert phase (atomic): restore files → delete untracked → mark spec 020 cancelled → archive it → verify clean baseline with `npm run build` + `npm test`.
2. Token phase: rewrite `ui/src/styles/index.css` token values for `:root` (dark) and `html.light`, update `.panel`, density variants, focus ring, scrollbar, keyframes, reduced-motion block; register tokens in Tailwind config.
3. Shell phase: restyle `TopBar`, `Sidebar` (desktop/tablet rail/mobile drawer), `CommandPalette`, `ViewHeader`, `FilterBar`, `SessionSelector`.
4. View phase: restyle each view + presentational components, one commitable unit per view, each verified in dark/light/compact/reduced-motion.
5. Verification: full build + test + manual per-view checklist + screenshots.

## Constraints

- Stack fixed: Vite + React + TypeScript + Tailwind v3 (`darkMode: 'class'`), CSS variables mapped into the Tailwind theme.
- Keep existing CSS variable *names* where possible — change values, not names; any rename mapped explicitly.
- UI imports shared logic from `../../src/lib/*` (ADR 001) — imports must not change.
- No new dependencies (no component library, no animation library).
- No backend feature work; the only backend change is removal of spec 020's `/api/cli/*` routes via revert.
- No structural refactor of component decomposition — restyle in place.
- Revert must touch only the 9 listed files.
- No changes to event ingestion, adapters, skill inference, or WebSocket protocol.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Revert discards CLI work wanted later | Documented recoverable from git history in spec 020 cancellation note |
| Token rename ripples through components | Names kept where possible; any rename has an explicit atomic mapping in design-ui.md |
| Light mode degrades while focusing on dark | Light mode is a per-view checklist item, verified in review |
| Empty state (no sessions) | Renders correctly in every restyled view |
| Light-mode contrast for accent/semantic colors | Checked per view in the manual checklist |
| Running dev server after revert | Must be restarted (the `/api/cli/*` endpoints disappear); no persisted settings affected |

## Acceptance Criteria

- AC-01: Given the repo root, `git status` shows no spec-020 changes; spec 020 folder sits in `specs/archive/2026-07-14-020-dashboard-redesign/` with `status: cancelled` and `superseded_by: 021-dashboard-console-redesign`.
- AC-02: Given `servers/dashboard/`, `npm run build` passes and `npm test` passes with all pre-existing tests unchanged.
- AC-03: Given the dashboard, all 7 views + shell components render the new design system in dark and light mode, both densities, and with reduced motion.
- AC-04: Given the token system, `ui/src/styles/index.css` documents the new values and `tailwind.config` registers any new/renamed tokens.
- AC-05: Given `git diff` of the shipped change, no file outside the `.spec.yaml` affected_files list is modified.
- AC-06: Given the dashboard data contracts, `ClientSession`/`ClientEvent` types and `ui/src/lib/*` logic are byte-identical to HEAD.

## Done When

- [x] AC-01 — verified via `git status` + archive folder inspection
- [x] AC-02 — verified via `npm run build` + `npm test` in `servers/dashboard/`
- [x] AC-03 — verified via manual walkthrough of all 7 views × 2 themes × 2 densities × reduced motion
- [x] AC-04 — verified via design-ui.md + index.css review
- [x] AC-05 — verified via `git diff --stat` review against affected_files
- [x] AC-06 — verified via `git diff HEAD -- ui/src/lib/` review
