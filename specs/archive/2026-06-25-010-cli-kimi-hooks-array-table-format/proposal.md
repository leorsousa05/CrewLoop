# Proposal: Write Kimi hooks as [[hooks]] array-of-tables per official docs

## WHY

The official Kimi Code CLI documentation (https://moonshotai.github.io/kimi-code/zh/customization/hooks.html) defines hooks as an array-of-tables in `~/.kimi-code/config.toml`:

```toml
[[hooks]]
event = "PreToolUse"
command = "crewloop-shim kimi --default-skill orchestrator"

[[hooks]]
event = "PostToolUse"
command = "crewloop-shim kimi --default-skill orchestrator"
```

The current CrewLoop CLI writes a legacy `[hooks]` table with `before_tool_use` / `after_tool_use` keys. That format does not match the documented schema and will not be recognized by Kimi Code. The dashboard adapter for Kimi already expects `PreToolUse` / `PostToolUse` event names, so only the CLI writer needs to change.

## Scope

1. Rewrite `KimiHookWriter` to emit the documented `[[hooks]]` array-of-tables format.
2. Use `event` names from agent config (`PreToolUse` / `PostToolUse` for Kimi, matching the dashboard adapter).
3. Implement idempotency by scanning existing `[[hooks]]` blocks for matching `event` + `command`.
4. Update `servers/dashboard/config-examples/kimi-code-config.toml` to the new format.
5. Update CLI help text and `specs/living/cli/spec.md`.
6. Update tests to assert the new TOML format.

## Discovered bug during implementation

When the Kimi config already contains the new `[[hooks]]` blocks, the installer skips `addHook` because `hasHook` returns true. The legacy-table cleanup currently runs only as a side effect of `addHook`, so the old `[hooks]` table (`before_tool_use` / `after_tool_use`) is never removed. This leaves the config in an invalid hybrid state with both the legacy table and the new array-of-tables.

The fix is to make legacy-hook cleanup an explicit, unconditional step in the installation flow, implemented by the agent-specific writer.

## Constraints

- Must match the documented Kimi schema exactly.
- Must not change Codex/Claude/AGY writers.
- Must not change the dashboard adapter or shim.
- Preserve simple comments outside `[[hooks]]` blocks when possible.
- Cleanup must run even when the new hooks are already present.
