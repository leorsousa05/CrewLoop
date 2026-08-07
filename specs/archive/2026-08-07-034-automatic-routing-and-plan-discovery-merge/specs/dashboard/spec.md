# Spec Delta: Dashboard

## Current State

The dashboard has icon maps for 8 skills including `crewloop:hub` and `crewloop:brainstorm`. The `canonicalSkillName` helper maps `crewloop-<slug>` directories to `crewloop:<slug>` names, so the icon key is already name-agnostic as long as the entry exists in the map.

## Changes

### MODIFIED
- `servers/dashboard/src/lib/constants.ts` — `SKILL_ICONS` keyed by the 6 remaining names; remove `crewloop:hub` and `crewloop:brainstorm` entries.
- `servers/dashboard/src/skills/registry.ts` — `SKILL_ICONS` keyed by the 6 remaining names; remove `crewloop:hub` and `crewloop:brainstorm` entries.

## Migration Notes

Events from older installs that report `crewloop:hub` or `crewloop:brainstorm` fall back to the default icon. New installs will only report the 6 skills.

## Backward Compatibility

Non-breaking at runtime; display-only change.
