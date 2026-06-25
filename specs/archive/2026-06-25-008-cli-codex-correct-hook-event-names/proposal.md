# Proposal: Use agent-specific hook event names in CLI config writers

## WHY

After fixing the hook command format in spec 007, the user ran `crewloop install` and inspected the Codex CLI hook list. Codex reported:

```
Event                 Installed   Active      Description
PreToolUse            0           0           Before a tool executes
PostToolUse           0           0           After a tool executes
```

All other Codex events also showed `Installed 0`. The existing `~/.codex/hooks.json` contained:

```json
{
  "hooks": {
    "before_tool_use": { "command": "crewloop-shim", "args": [...] },
    "after_tool_use": { "command": "crewloop-shim", "args": [...] }
  }
}
```

Codex ignores those keys. It expects:

```json
{
  "hooks": {
    "PreToolUse": { "command": "crewloop-shim", "args": [...] },
    "PostToolUse": { "command": "crewloop-shim", "args": [...] }
  }
}
```

The dashboard adapter for Codex (`servers/dashboard/src/adapters/codex.ts`) already maps `PreToolUse` → `tool_start` and `PostToolUse` → `tool_end`. Therefore the only broken link is the CLI writer, which hard-codes the event keys as `before_tool_use` / `after_tool_use` for every agent.

## Scope

1. Make hook event names configurable per agent in `packages/cli/src/agents.ts`.
2. Update `packages/cli/src/hooks.ts` to use the agent-specific event names when reading, writing, and matching hooks.
3. Keep Kimi using `before_tool_use` / `after_tool_use` (TOML keys understood by Kimi Code).
4. Set Codex to `PreToolUse` / `PostToolUse`.
5. Keep Claude and AGY on `before_tool_use` / `after_tool_use` until their docs confirm otherwise.
6. Update `servers/dashboard/config-examples/codex-hooks.json` to use `PreToolUse` / `PostToolUse`.
7. Update CLI help text (`packages/cli/src/cli.ts`) to describe agent-specific hook names.
8. Update tests to assert Codex uses `PreToolUse` / `PostToolUse` and Kimi keeps `before_tool_use` / `after_tool_use`.
9. Update `specs/living/cli/spec.md` and `AGENTS.md` if needed.

## Constraints

- Must not change the dashboard adapter or shim behavior.
- Must remain idempotent: rerunning `crewloop install` should not duplicate entries.
- Must clean up legacy `before_tool_use` / `after_tool_use` entries in Codex `hooks.json` (they are ignored by Codex and would otherwise persist as dead config).
