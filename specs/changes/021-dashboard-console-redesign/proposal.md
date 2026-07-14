# Proposal: Dashboard Developer-Console Redesign

## Status
- **State:** active
- **Created:** 2026-07-14
- **Author:** Architect

## Problem Statement

Two problems exist simultaneously:

1. **Uncommitted work from spec 020 is in limbo.** Spec `020-dashboard-redesign` ("Dashboard Redesign & CLI Feature Integration") mixed two unrelated concerns — a visual redesign (blue minimalist theme) and a CLI management feature (`CLIConfigPanel` + `/api/cli/*` backend routes). It was marked `completed` but never committed. The working tree is dirty, HEAD still carries the amber Vercel command-center theme (spec 017), and the blue theme direction was rejected by the user.
2. **The dashboard visual design needs a deliberate, complete pass.** The committed amber theme was built incrementally across many fix specs (017, 2026-07-10-014/015/016/017). It works, but it was never re-audited as a whole: spacing rhythm, hierarchy, density defaults, and view-to-view consistency drifted. The user wants a full redesign of shell + all views with a **developer console / minimalist** direction.

## Goals

1. **Revert spec 020 cleanly** — restore the 7 modified files to HEAD, delete the 2 untracked implementation files, and mark spec 020 as cancelled/superseded. Working tree returns to a known-good baseline before any new design work begins.
2. **Full visual redesign** — new design system (tokens, typography, spacing, motion) covering the app shell (`App`, `TopBar`, `Sidebar`, `CommandPalette`, `ViewHeader`, `FilterBar`, `SessionSelector`) and every view (`Overview`, `Sessions`, `Timeline`, `Network`, `Files`, `Skills`, `Settings`), with a developer-console / minimalist aesthetic: dark-first, information-dense, monospace-driven, low ornamentation.
3. **Zero behavioral regression** — no changes to data contracts (`ClientSession`, `ClientEvent`), contexts (`Settings`, `PinnedSessions`, `Filter`), hooks, or pure logic in `ui/src/lib/*`. All existing unit tests stay green.

## Non-Goals

- No CLI management UI (the `CLIConfigPanel` feature from spec 020). If wanted later, it becomes its own spec — the work is recoverable from git history.
- No backend feature work. The only backend change is the *removal* of spec 020's `/api/cli/*` routes via revert.
- No new dependencies (no component library, no animation library).
- No changes to event ingestion, adapters, skill inference, or WebSocket protocol.
- No structural refactor of component decomposition — restyle in place.

## Constraints

- Stack is fixed: Vite + React + TypeScript + Tailwind v3 (`darkMode: 'class'`) with CSS variables mapped into the Tailwind theme.
- Dark mode is primary; light mode must keep working via `html.light`.
- Density modes (`density-compact` / `density-comfortable`) and `prefers-reduced-motion` support must be preserved.
- UI imports shared logic from `../../src/lib/*` (ADR 001) — imports must not change.
- The dashboard must still run with `npm run dev` / `npm start` from `servers/dashboard/` with no new config.
- Revert must not touch unrelated history: only the 9 files listed in the Revert scope.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Revert discards CLI integration work that may be wanted later | Med | Work is recoverable from the reflog/uncommitted diff; document this in spec 020's cancellation note |
| Visual regressions with no automated visual testing | High | Per-view manual checklist in `tasks.md`; before/after screenshots; Reviewer gate |
| Token rename ripples through every component | Med | Keep existing CSS variable *names* where possible; change values, not names; any rename mapped explicitly in `design.md` |
| Light mode degrades while focusing on dark | Med | Light mode is a checklist item per view, verified in Reviewer pass |
| Scope creep into behavior/logic changes | Med | Spec explicitly limits changes to presentational layer; Reviewer checks diff against affected_files |

## Success Criteria

- [ ] `git status` clean of all spec-020 changes (files restored, untracked files removed, spec 020 archived as cancelled)
- [ ] `npm run build` passes in `servers/dashboard/`
- [ ] All existing tests pass (`npm test` in `servers/dashboard/`)
- [ ] New token system documented in `design-ui.md` (by Designer) and implemented in `index.css`
- [ ] All 7 views + shell components restyled per the design spec, dark and light mode
- [ ] Density modes and reduced-motion still functional
- [ ] No changes to `ui/src/lib/*` logic, hooks, contexts, or backend contracts (except revert)
