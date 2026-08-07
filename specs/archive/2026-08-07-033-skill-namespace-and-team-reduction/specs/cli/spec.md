# Spec Delta: CLI

## Current State

CLI hardcodes `crewloop-hub` in hook templates (`--default-skill`), detects the monorepo root via `skills/crewloop-hub/SKILL.md`, and ships an opt-in `--diamondblock` install flag with layered doctor checks (skill, binary, installer readiness, runtime guidance).

## Changes

### MODIFIED
- `packages/cli/src/agents.ts` → default skill in hook templates for all 5 agents verified/kept as `crewloop-hub` (directory name unchanged); comments updated to the `crewloop:hub` logical name.
- `packages/cli/src/commands/doctor.ts` → diamondblock layered checks removed entirely.
- `packages/cli/src/help.ts` → `--diamondblock` flag documentation removed.
- `packages/cli/src/tests/args.test.ts` → `--diamondblock` parsing tests removed.
- `packages/cli/src/tests/commands.test.ts` → diamondblock install/doctor tests removed.

### REMOVED
- `--diamondblock` install flag and all diamondblock doctor logic.

## Migration Notes

`crewloop install --diamondblock` no longer exists; scripts using it will get an unknown-flag error.

## Backward Compatibility

Breaking for the `--diamondblock` flag only. Core install behavior unchanged (installer is generic over skill directories).
