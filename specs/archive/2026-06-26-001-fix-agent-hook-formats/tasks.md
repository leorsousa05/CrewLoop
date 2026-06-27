# Tasks: Fix agent hook configuration formats

## Pre-implementation

- [x] Read this spec, `design.md`, and `packages/cli/AGENTS.md` requirements.
- [x] Confirm Node.js test runner commands with `package.json`.

## Implementation

- [x] Update `HookEntry` interface in `packages/cli/src/hooks.ts` to include `event`, `matcher`, `command`, and optional `timeout`.
- [x] Update `AgentHookConfigWriter` interface to replace `addHook` / `hasHook` with `syncHooks`.
- [x] Update `AgentHookConfig` in `packages/cli/src/agents.ts` to provide the list of hooks per agent (or keep existing fields and derive the list).
- [x] Rewrite `KimiHookWriter`:
  - [x] Parse `[[hooks]]` array-of-tables.
  - [x] Identify CrewLoop hooks by `command.includes('crewloop-shim')`.
  - [x] Implement `syncHooks` that removes old CrewLoop blocks and appends new `PreToolUse` / `PostToolUse` blocks.
  - [x] Implement `buildDefaultConfig` using target TOML format.
- [x] Create shared JSON writer base for Codex, Claude, and AGY:
  - [x] Define matcher/hook command types.
  - [x] Implement `syncHooks` that navigates the correct object path (`hooks` for Codex/Claude, `crewloop` for AGY).
  - [x] Implement `buildDefaultConfig` using target JSON format.
- [x] Update `CodexHookWriter`, `ClaudeHookWriter`, `AgyHookWriter` to extend the new JSON base.
- [x] Update `installHooksForAgent` to use `syncHooks` and derive `HookEntry[]`.
- [x] Ensure backup, dry-run, and error handling remain unchanged.
- [x] Add `packages/cli/AGENTS.md` documenting:
  - [x] Each agent's real hook format.
  - [x] Why formats differ.
  - [x] How to add or modify agent hook formats.
  - [x] The "CrewLoop hook identification" rule (`command.includes('crewloop-shim')`).

## Testing

- [x] Update `packages/cli/src/tests/hooks.test.ts`:
  - [x] Kimi target format assertions.
  - [x] Kimi idempotency assertions.
  - [x] Kimi user-hook preservation assertions.
  - [x] Kimi old-format migration assertions.
  - [x] Codex target format assertions.
  - [x] Claude target format assertions.
  - [x] AGY target format assertions.
  - [x] AGY group isolation assertions.
  - [x] Keep existing backup, dry-run, unsupported, skipped, and malformed JSON tests.
- [x] Run tests and fix failures.

## Documentation

- [x] Update `packages/cli/README.md` hook section if it exists or if examples are misleading.
- [x] Verify `packages/cli/AGENTS.md` is accurate and complete.

## Final verification

- [x] Run full CLI test suite.
- [x] Review diff for unintended changes.
