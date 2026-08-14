# spec-022-dashboard-saas-minimalist-redesign

---
name: spec-022-dashboard-saas-minimalist-redesign
domain: 02-dashboard
status: completed
created: 2026-07-14
completed: 2026-07-14
supersedes: [spec-021-dashboard-console-redesign]
---

# Dashboard SaaS Minimalist Redesign

## Objective

Replace the dashboard visual direction with a light-first SaaS minimalist aesthetic (Linear/Vercel/Raycast influence) and remove the Network 3D view, leaving six primary views — with zero behavioral regression.

## Context

- Supersedes spec-021-dashboard-console-redesign (dark industrial phosphor direction rejected by user).
- Dashboard architecture: `shared/architecture-overview.md` §Dashboard; ADR 003 (hash navigation).

## Requirements

1. Supersede spec 021 cleanly — mark it `status: superseded`, `superseded_by: 022-dashboard-saas-minimalist-redesign`; start from a known baseline (reverting any partial 021 implementation).
2. Full SaaS minimalist redesign: light-first, clean, information-dense — soft neutrals, thin borders, subtle shadows, controlled whitespace, single refined accent color.
3. Remove the Network view: delete `NetworkView.tsx` and `Network3D.tsx`, remove `'network'` from the `View` union and `VIEWS` array in `App.tsx`, remove from command palette, drop `react-force-graph-3d` from `package.json` + `package-lock.json` (if unused elsewhere).
4. Zero behavioral regression: preserve `ClientSession`/`ClientEvent` contracts, contexts, hooks, pure logic, command palette behavior, filters, and WebSocket event flow.
5. Preserve density modes and `prefers-reduced-motion`.
6. Light mode is the primary visual reference; dark mode stays functional via `html.dark`.

## Behavior / Flow

1. Baseline cleanup: inspect `git status`; verify `npm run build` + `npm test` pass on the baseline.
2. Network removal: edit `types.ts` (View union), `App.tsx` (VIEWS, renderView, imports), delete the two components, remove the dependency, regenerate `package-lock.json`, verify build+tests.
3. Token phase: rewrite `index.css` tokens for `:root`/`html.light`, update `.panel`, density variants, focus ring, scrollbar, keyframes, reduced-motion; register tokens in `tailwind.config.js` (font-display: Teko → Space Grotesk).
4. Shell + views restyle, one commitable unit per view; per-view verification in light + dark + compact + reduced motion.
5. Completion: `.spec.yaml` status completed; archive handled by ship.

## Constraints

- Stack fixed: Vite + React + TypeScript + Tailwind v3 (`darkMode: 'class'`), CSS variables in the Tailwind theme.
- Keep existing CSS variable *names* where possible; any rename mapped explicitly.
- UI imports shared logic from `../../src/lib/*` — imports unchanged.
- No new dependencies; no structural refactor; restyle in place.
- No backend feature work; no changes to event ingestion, adapters, skill inference, or WebSocket protocol.
- Backend `src/lib/graph.ts` left untouched (may exist for history; future cleanup separate).
- All existing tests in `servers/dashboard/` must continue to pass.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Partial 021 implementation conflicts in working tree | Phase 0 restores a clean baseline; shipper reconciles final diff |
| `react-force-graph-3d` unused but still installed | Removed from both `package.json` and `package-lock.json`; build verified |
| Light-first palette degrades dark contrast | Dark mode is a per-view checklist item; reviewer verifies contrast |
| Token rename ripple | Names kept where possible; explicit atomic mapping in design-ui.md |
| Open branches depending on Network view | Must rebase or drop those changes (migration note) |
| Command palette still offering Network | Explicitly verified — palette derives items from `VIEWS`, so removal propagates |
| Empty state (no sessions) | Renders correctly in every restyled view |

## Acceptance Criteria

- AC-01: Given `specs/features/02-dashboard/spec-021-dashboard-console-redesign.md`, it is marked `status: completed` with this spec listed in its supersedes history; spec 021 is superseded.
- AC-02: Given the dashboard source, `'network'` appears nowhere in the `View` union, `VIEWS`, `renderView()`, or command palette; `NetworkView.tsx` and `Network3D.tsx` do not exist; `react-force-graph-3d` is absent from `package.json` and `package-lock.json`.
- AC-03: Given `servers/dashboard/`, `npm run build` passes and `npm test` passes.
- AC-04: Given the dashboard, all 6 remaining views + shell render the SaaS minimalist design in light and dark mode, both densities, and reduced motion.
- AC-05: Given `git diff` of the shipped change, no file outside the `.spec.yaml` affected_files list is modified.
- AC-06: Given the data contracts, `ClientSession`/`ClientEvent` and `ui/src/lib/*` logic are unchanged from HEAD.

## Done When

- [x] AC-01 — verified via spec 021 frontmatter + proposal status
- [x] AC-02 — verified via grep for `network`/`Network3D`/`react-force-graph-3d` + file listing
- [x] AC-03 — verified via `npm run build` + `npm test` in `servers/dashboard/`
- [x] AC-04 — verified via manual walkthrough (deferred items tracked in original tasks.md)
- [x] AC-05 — verified via `git diff --stat` review
- [x] AC-06 — verified via `git diff HEAD -- ui/src/lib/` review
