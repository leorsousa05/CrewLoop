# Spec Delta: Dashboard

## Current State

Dashboard keys skill icons and inference by flat names: `SKILL_ICONS` (13 entries) in `skills/registry.ts`, a UI icon map in `lib/constants.ts` (with a stray `project-mapper`), and git-command inference to `shipper` in `skills/mapping.ts`. Tests use `crewloop-hub`, `architect`, `engineer`, `shipper` fixtures.

## Changes

### MODIFIED
- `servers/dashboard/src/skills/registry.ts` → `SKILL_ICONS` keyed by the 8 new names (`crewloop:hub` … `crewloop:docs`).
- `servers/dashboard/src/lib/constants.ts` → icon map aligned to the 8 names; stray `project-mapper` dropped.
- `servers/dashboard/src/skills/mapping.ts` → git commit/push inference targets `crewloop:ship`.
- Dashboard tests (`skills/infer.test.ts`, `state.test.ts`, `adapters.test.ts`, `tests/*`) → fixtures updated to new names.

### REMOVED
- Icon/map entries for the 11 removed skills and `project-mapper`.

## Migration Notes

Sessions from older installs reporting old skill names fall back to the default icon (existing graceful degradation).

## Backward Compatibility

Non-breaking at runtime; display-only change.
