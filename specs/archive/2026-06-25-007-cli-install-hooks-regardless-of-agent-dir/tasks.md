## Phase 1 — Fix JSON hook command format

- [x] Change `beforeToolUseCommand` / `afterToolUseCommand` storage to allow splitting into `command` + `args`.
  - [x] Update `buildDefaultConfig()` to emit `{ command, args }` objects.
  - [x] Update `setJsonCommand()` to emit `{ command, args }` objects.
  - [x] Ensure existing string entries are recognized as equivalent by `jsonCommandMatches` and upgraded on write.

## Phase 2 — Relax agent detection

- [x] Modify `agentIsInstalled()` in `packages/cli/src/hooks.ts` to return `true` for supported agents.
- [x] Ensure unsupported agents (cursor, windsurf) still return `unsupported`.
- [x] Verify `writeConfig()` creates the parent directory when it does not exist (already implemented).

## Phase 3 — Update tests

- [x] Update `packages/cli/src/tests/hooks.test.ts`:
  - [x] Assert Codex JSON hooks are written as `{ command, args }` objects.
  - [x] Assert `installHooksForAgent` configures an agent even when neither skills dir nor config dir exists.
  - [x] Update the previous "skipped when agent is not installed" test to reflect new behavior.
  - [x] Test idempotency with object-formatted hooks.

## Phase 4 — Update documentation

- [x] Update `AGENTS.md` to clarify that hooks are configured for all supported agents proactively.

## Phase 5 — Verification

- [x] Run `npm run build` in `packages/cli`.
- [x] Run `npm test` in `packages/cli`.
- [x] Run `python scripts/validate-skills.py`.
- [x] Manual test: run `crewloop install`, verify `~/.codex/hooks.json` uses object format, and confirm Codex events appear in the dashboard.
