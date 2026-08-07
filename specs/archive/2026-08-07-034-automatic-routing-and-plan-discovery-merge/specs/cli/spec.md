# Spec Delta: CLI

## Current State

The CLI installs `crewloop-hub` as the default skill in agent hooks (`--default-skill crewloop-hub`) and detects the monorepo root by looking for `skills/crewloop-hub/SKILL.md`. The help examples mention `crewloop-hub` as the default entry skill.

## Changes

### MODIFIED
- `packages/cli/src/agents.ts` — change hook command to `--default-skill crewloop-plan`.
- `packages/cli/src/cli.ts` — change root detection to `skills/crewloop-plan/SKILL.md`.
- `packages/cli/src/help.ts` — update help examples and any text referencing the default skill to `crewloop-plan`.

## Migration Notes

Users who already installed hooks will get the new default skill on next `crewloop install`. The dashboard maps the directory name `crewloop-plan` to the canonical `crewloop:plan`.

## Backward Compatibility

Non-breaking for the CLI source, but the installed default skill changes. The old `crewloop-hub` skill will no longer be installed.
