# Tasks: Fix Kimi Code hook matcher regex

## Implementation

- [x] Change Kimi `matcher` in `packages/cli/src/hooks.ts` from `"*"` to `".*"` (via `KimiHookWriter.toKimiBlock`).
- [x] Update `packages/cli/src/tests/hooks.test.ts` assertions that expect `"*"` for Kimi.
- [x] Update `packages/cli/AGENTS.md` Kimi matcher documentation to describe regex semantics.
- [x] Update `specs/living/cli/hooks.md` Kimi matcher example and default rule.

## Testing

- [x] Run `npm run build && npm test` in `packages/cli`.
- [x] Confirm all 55 tests pass.

## Verification

- [x] Run `crewloop install` to rewrite `~/.kimi-code/config.toml`.
- [x] Start a Kimi session and invoke the `Bash` tool.
- [x] Confirm the dashboard receives both `tool_start` (PreToolUse) and `tool_end` (PostToolUse) events.
