# Spec Delta: CLI — Codex Windows sandbox health checks

## Current state

- `crewloop install` configures hooks for supported agents.
- There is no command to verify whether an agent's hook environment is healthy.
- Codex on Windows can fail to run hooks due to a missing sandbox helper on `PATH`; users receive no guidance from CrewLoop.

## Changes

### ADDED
- `crewloop doctor` command.
- `packages/cli/src/health.ts` with per-agent health checks.
- Windows-specific Codex sandbox helper discovery check.
- Documentation of the workaround in `specs/living/cli/spec.md` and help text.

### MODIFIED
- `packages/cli/src/cli.ts`
  - Parse `doctor` command.
  - Add `handleDoctor` handler.
  - Show health warnings after `crewloop install` when an agent has a non-ok result.
- `packages/cli/src/hooks.ts`
  - Reuse `AgentConfig` metadata in health checks.
- `packages/cli/src/tests/cli.test.ts`
  - Add tests for `doctor` command and warning output.
- `packages/cli/src/tests/health.test.ts` (new)
  - Tests for Codex sandbox detection.

### REMOVED
- Nothing.

## Backward compatibility

Non-breaking. `crewloop doctor` is a new command. Existing commands remain unchanged except for an additional post-install warning section.
