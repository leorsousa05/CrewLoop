# Tasks: CLI Auto-Configure Agent Hooks

## Phase 1 — Extend agent metadata

- [x] Extend `AgentConfig` interface in `packages/cli/src/agents.ts` to include `hooks` metadata.
- [x] Add hook metadata for `kimi`, `claude`, `codex`, `agy`, `cursor`, and `windsurf`.
- [x] Update `listSupportedAgents()` and `resolveAgentDir()` to preserve existing behavior.

## Phase 2 — Create hook writers

- [x] Create `packages/cli/src/hooks.ts`.
- [x] Define `AgentHookConfigWriter` interface.
- [x] Implement `KimiHookWriter` (TOML).
- [x] Implement `CodexHookWriter` (JSON).
- [x] Implement `ClaudeHookWriter` (JSON).
- [x] Implement `AgyHookWriter` (JSON).
- [x] Implement `installHooksForAgent()` with backup and dry-run support.
- [x] Implement `installHooks()` orchestration.

## Phase 3 — Wire into CLI

- [x] Add `--hooks` and `--no-hooks` flags to `parseArgs()` in `packages/cli/src/cli.ts`.
- [x] Call `installHooks()` from `handleInstall()` after MCP install.
- [x] Print hook configuration summary.
- [x] Ensure `--dry-run` is respected.

## Phase 4 — Tests

- [x] Create `packages/cli/src/tests/hooks.test.ts`.
- [x] Test Kimi TOML idempotency.
- [x] Test JSON idempotency for Codex/Claude/AGY.
- [x] Test backup creation.
- [x] Test dry-run.
- [x] Test unsupported agent handling.
- [x] Test missing-agent skipping.
- [x] Test malformed JSON error handling.
- [x] Run `npm test` in `packages/cli`.

## Phase 5 — Documentation

- [x] Update `AGENTS.md` to remove `scripts/install.sh` references.
- [x] Document `crewloop install` auto-configures hooks.
- [x] Document `--no-hooks` option.
- [x] Update repository structure section in `AGENTS.md`.
- [x] Run `python scripts/validate-skills.py`.

## Phase 6 — Verification

- [x] Manual test: `crewloop install` configures Kimi hooks.
- [x] Manual test: second run is idempotent.
- [x] Manual test: `--no-hooks` skips hook config.
- [x] Manual test: `--dry-run` does not write files.
