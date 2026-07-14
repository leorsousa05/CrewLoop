# Spec Delta: dashboard/ui

## Current State

The committed baseline (HEAD) carries the amber Vercel command-center theme from archived spec 017, incrementally patched by later fix specs. The working tree additionally contains uncommitted spec-020 changes: a blue minimalist token set in `index.css`, a `CLIConfigPanel` component, `/api/cli/*` backend routes, and a `cli` view wired into `App.tsx`, `Sidebar.tsx`, `TopBar.tsx`, and `types.ts`.

## Changes

### ADDED
- Nothing new is added to the runtime system. This spec produces a restyle of existing components only.
- `specs/changes/021-dashboard-console-redesign/design-ui.md` — visual specification produced by the Designer (tokens, per-component specs, motion table, responsive rules, accessibility checklist).

### MODIFIED
- `ui/src/styles/index.css` → reverted to HEAD, then rewritten with the new token values, `.panel` style, density variants, and keyframes defined in `design-ui.md`.
- Shell components (`App`, `TopBar`, `Sidebar`, `CommandPalette`, `ViewHeader`, `FilterBar`, `SessionSelector`) → restyled per `design-ui.md`; props and behavior unchanged.
- View components (`Overview`, `SessionsView`, `TimelineView`, `NetworkView`, `FilesView`, `SkillsView`, `SettingsView`) → restyled per `design-ui.md`; data flow unchanged.
- Presentational components (`ActiveSkillPanel`, `TelemetryPanel`, `ActivityGraph`, `Timeline`, `TimelineRow`, `FileList`, `FileDiff`, `FileActivity`, `Network3D`, `ui/StatusBadge`) → restyled per `design-ui.md`.
- `ui/index.html` → font link changes only if `design-ui.md` changes the type pairing.

### REMOVED
- All spec-020 uncommitted changes (via revert):
  - `servers/dashboard/src/api/cli.ts` (deleted)
  - `servers/dashboard/ui/src/components/CLIConfigPanel.tsx` (deleted)
  - `/api/cli/*` route wiring in `servers/dashboard/src/server.ts` (restored)
  - `cli` view entries in `App.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `ui/src/lib/types.ts` (restored)
  - Blue token set in `ui/src/styles/index.css` (restored, then superseded by new tokens)
  - `ui/src/lib/tree.test.ts` spec-020 edit (restored)
- Spec 020 itself: `.spec.yaml` marked `cancelled` with `superseded_by: 021-dashboard-console-redesign`; folder moved to `specs/archive/2026-07-14-020-dashboard-redesign/`.

## Migration Notes

No data or API migration. Developers with a running dashboard must restart the dev server after the revert (the `/api/cli/*` endpoints disappear). No persisted settings are affected: theme/density/reduced-motion keys in localStorage keep their names and values.

## Backward Compatibility

- **Backend contracts:** fully compatible after revert — same REST routes and WebSocket messages as HEAD.
- **UI settings:** compatible — no new or renamed localStorage keys.
- **CLI integration feature:** intentionally removed; recoverable from git history if a future spec reinstates it.
