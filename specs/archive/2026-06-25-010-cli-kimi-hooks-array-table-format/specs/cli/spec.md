# Spec Delta: CLI — Kimi hooks

## Current state

- `KimiHookWriter` emits the documented `[[hooks]]` array-of-tables format.
- `KimiHookWriter.addHook` removes the legacy `[hooks]` table as a side effect.
- `installHooksForAgent` skips `addHook` when `hasHook` reports the new hooks are already present.

## Changes

### ADDED
- Optional `removeLegacyHooks?(config): AgentHookConfigFile` method on `AgentHookConfigWriter`.
- Explicit legacy-cleanup call in `installHooksForAgent` before idempotency checks.
- Tests for hybrid legacy + new-block configs and full legacy-table replacement.

### MODIFIED
- `packages/cli/src/hooks.ts`
  - `AgentHookConfigWriter` interface gains `removeLegacyHooks?`.
  - `KimiHookWriter` exposes a public `removeLegacyHooks` that wraps the existing table-removal logic.
  - `installHooksForAgent` invokes `removeLegacyHooks` when `legacyEventNames` are configured.
- `packages/cli/src/tests/hooks.test.ts`
  - New assertions for legacy-table removal and idempotency.

### REMOVED
- Nothing.

## Migration notes

Users who already ran the previous version will have both `[hooks]` and `[[hooks]]` in `~/.kimi-code/config.toml`. Running `crewloop install` after this fix removes the stale `[hooks]` table automatically.

## Backward compatibility

Non-breaking for users. The legacy table was already non-functional; removing it makes the config match the documented schema.
