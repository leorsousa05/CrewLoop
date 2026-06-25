## Phase 1 — Add per-agent event names

- [x] Add `beforeToolUseEventName` and `afterToolUseEventName` (or `eventNames` object) to `AgentHookConfig` in `packages/cli/src/agents.ts`.
- [x] Populate Kimi with `before_tool_use` / `after_tool_use`.
- [x] Populate Codex with `PreToolUse` / `PostToolUse`.
- [x] Populate Claude and AGY with `before_tool_use` / `after_tool_use`.

## Phase 2 — Update hook writers

- [x] Change `HookEntry.event` from enum to `string` (or include agent-specific names).
- [x] Update `KimiHookWriter` to use the agent-specific event names for TOML keys.
- [x] Update `JsonHookWriter` / `JsonHooksShape` to use dynamic keys (`Record<string, ...>`) and the agent-specific event names.
- [x] Update `installHooksForAgent` to construct hooks with agent-specific event names.
- [x] Ensure legacy `before_tool_use` / `after_tool_use` entries are removed from Codex `hooks.json` when installing.

## Phase 3 — Update tests

- [x] Update Codex JSON tests to assert keys `PreToolUse` / `PostToolUse`.
- [x] Add test for cleanup of legacy `before_tool_use` / `after_tool_use` in Codex config.
- [x] Keep Kimi tests asserting `before_tool_use` / `after_tool_use`.
- [x] Keep Claude/AGY tests asserting `before_tool_use` / `after_tool_use`.

## Phase 4 — Update examples and docs

- [x] Update `servers/dashboard/config-examples/codex-hooks.json` to use `PreToolUse` / `PostToolUse`.
- [x] Update CLI help text in `packages/cli/src/cli.ts` to mention agent-specific event names.
- [x] Update `specs/living/cli/spec.md`.
- [x] Update `AGENTS.md` if it mentions specific event names.

## Phase 5 — Verification

- [x] Run `npm run build` in `packages/cli` and `servers/dashboard`.
- [x] Run `npm test` in `packages/cli` and `servers/dashboard`.
- [x] Run `python scripts/validate-skills.py`.
- [x] Reinstall globally and run `crewloop install`, then check `~/.codex/hooks.json` and Codex hook list.
