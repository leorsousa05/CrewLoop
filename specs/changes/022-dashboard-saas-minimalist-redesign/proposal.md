# Proposal: Dashboard SaaS Minimalist Redesign

## Status

- **State:** active
- **Created:** 2026-07-14
- **Author:** Architect

## Problem Statement

The active spec `021-dashboard-console-redesign` defined a dark industrial / phosphor-lit visual direction for the CrewLoop dashboard. After the design discussion with the user, two pivots are required:

1. **The visual direction must change.** The user wants a **clean SaaS minimalist aesthetic** (Linear / Vercel / Raycast influence) instead of the industrial phosphor console. This is a full restart of the visual system: palette, typography, elevation, radius, spacing, and component styling.
2. **The Network 3D view must be removed.** The user explicitly wants to drop the `Network` view and its `react-force-graph-3d` canvas, leaving six primary views: Overview, Sessions, Timeline, Files, Skills, Settings.

Because these changes contradict the approved `design-ui.md` in spec 021, continuing that spec would create confusion. A new spec is required to capture the revised direction, supersede 021, and provide a clean implementation plan.

## Goals

1. **Supersede spec 021 cleanly** — mark it as superseded and start the new redesign from a known baseline (reverting any partial 021 implementation if needed).
2. **Full SaaS minimalist redesign** — replace the current design system with a light-first, clean, information-dense aesthetic: soft neutrals, thin borders, subtle shadows, generous but controlled whitespace, and a single refined accent color.
3. **Remove the Network view** — delete `NetworkView.tsx`, `Network3D.tsx`, remove `network` from the `View` union, from the `VIEWS` array in `App.tsx`, from the command palette, and drop the `react-force-graph-3d` dependency from `package.json` if it is no longer used.
4. **Zero behavioral regression** — preserve data contracts (`ClientSession`, `ClientEvent`), contexts, hooks, pure logic, command palette behavior, filters, and WebSocket event flow.

## Non-Goals

- No backend feature work.
- No changes to event ingestion, adapters, skill inference, or WebSocket protocol.
- No new dependencies beyond what is already in `servers/dashboard/package.json` (no component library, no animation library).
- No structural refactor of component decomposition — restyle in place.
- No changes to file paths or module boundaries beyond deleting the Network view files.

## Constraints

- Stack is fixed: Vite + React + TypeScript + Tailwind CSS v3 (`darkMode: 'class'`) with CSS variables mapped into the Tailwind theme.
- Light mode is now primary visual reference; dark mode must remain functional via `html.dark`.
- Density modes (`density-compact` / `density-compact`) and `prefers-reduced-motion` support must be preserved.
- UI imports shared logic from `../../src/lib/*` — imports must not change.
- The dashboard must still run with `npm run dev` / `npm start` from `servers/dashboard/` with no new config.
- All existing tests in `servers/dashboard/` must continue to pass.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Partial 021 implementation in working tree conflicts with new direction | High | Phase 0 explicitly restores a clean baseline before styling begins; Shipper reviews diff against affected_files |
| Removing Network view leaves `react-force-graph-3d` unused but still installed | Low | Remove it from `package.json` and `package-lock.json` as part of the deletion; verify build still passes |
| Light-first palette degrades dark mode contrast | Med | Dark mode is a per-view checklist item; Reviewer verifies contrast |
| Token rename ripples through every component | Med | Keep existing CSS variable *names* where possible; change values, not names; any rename mapped explicitly in `design.md` |
| Scope creep into behavior/logic changes | Med | Spec explicitly limits changes to presentational layer and Network removal; Reviewer checks diff against affected_files |

## Success Criteria

- [ ] Spec 021 updated to `status: superseded` with `superseded_by: 022-dashboard-saas-minimalist-redesign`.
- [ ] Working tree is clean of conflicting 021 partial changes before redesign implementation starts.
- [ ] `network` is removed from `View` type, `VIEWS` array, command palette, and all UI references.
- [ ] `NetworkView.tsx` and `Network3D.tsx` are deleted.
- [ ] `react-force-graph-3d` is removed from `package.json` and `package-lock.json` (if no other usage exists).
- [ ] `npm run build` passes in `servers/dashboard/`.
- [ ] `npm test` passes in `servers/dashboard/`.
- [ ] New token system documented in `design-ui.md` and implemented in `index.css`.
- [ ] All 6 remaining views + shell components restyled per the SaaS minimalist design spec, both dark and light mode.
- [ ] Density modes and reduced-motion still functional.
- [ ] No changes to `ui/src/lib/*` logic, hooks, contexts, or backend contracts.
