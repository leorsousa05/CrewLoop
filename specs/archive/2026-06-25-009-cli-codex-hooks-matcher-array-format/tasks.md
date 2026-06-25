## Phase 1 — Implement Codex-specific writer

- [x] Define Codex hook types: `CodexHookCommand`, `CodexMatcherGroup`, `CodexHooksConfig`.
- [x] Override `buildDefaultConfig()` in `CodexHookWriter` to emit `hooks: { PreToolUse: [{ hooks: [{ type: 'command', command, args }] }], ... }`.
- [x] Override `addHook()` to append a matcher group when the command is not already present, and to overwrite legacy flat-object entries with the array format.
- [x] Override `hasHook()` to search inside nested arrays for an equivalent command.

## Phase 2 — Cleanup legacy Codex entries

- [x] Keep `legacyEventNames: ['before_tool_use', 'after_tool_use']` on Codex config.
- [x] In `CodexHookWriter.addHook()`, if the existing event value is not an array, replace it with the new array format.

## Phase 3 — Update tests

- [x] Update Codex tests to assert the matcher-array group shape.
- [x] Add test that a legacy flat-object `PreToolUse`/`PostToolUse` is replaced by arrays.
- [x] Add test that legacy `before_tool_use`/`after_tool_use` keys are removed.
- [x] Keep Kimi/Claude/AGY tests unchanged.

## Phase 4 — Update examples and docs

- [x] Update `servers/dashboard/config-examples/codex-hooks.json` to the documented array format.
- [x] Update CLI help text in `packages/cli/src/cli.ts`.
- [x] Update `specs/living/cli/spec.md`.

## Phase 5 — Verification

- [x] Run `npm run build --workspaces`.
- [x] Run `npm test --workspaces`.
- [x] Run `python scripts/validate-skills.py`.
- [x] Reinstall globally and run `crewloop install`, then verify `~/.codex/hooks.json` matches the documented schema.
