# Spec: Agent Hook Installation

## Current state

`packages/cli/src/hooks.ts` contains hook writers for four supported agents:

- `KimiHookWriter` — TOML `[hooks]` table with string keys `before_tool_use` / `after_tool_use`.
- `CodexHookWriter`, `ClaudeHookWriter`, `AgyHookWriter` — extend `JsonHookWriter` and write `hooks.before_tool_use` / `hooks.after_tool_use` strings.

These formats were inferred from early agent documentation and are incorrect for current versions.

## Target state

### Kimi Code (`~/.kimi/config.toml`)

Uses TOML array-of-tables. Each hook is a separate `[[hooks]]` block.

Example after installation:

```toml
[[hooks]]
event = "PreToolUse"
matcher = "*"
command = "crewloop-shim kimi --default-skill orchestrator"

[[hooks]]
event = "PostToolUse"
matcher = "*"
command = "crewloop-shim kimi --default-skill orchestrator"
```

CrewLoop entries are identified by a command containing `crewloop-shim`. User `[[hooks]]` blocks must be preserved.

### Codex (`~/.codex/hooks.json`)

Uses a top-level `"hooks"` object. Each event maps to an array of matcher blocks, and each matcher block contains a nested `hooks` array of command objects.

Example after installation:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim codex --default-skill orchestrator"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim codex --default-skill orchestrator"
          }
        ]
      }
    ]
  }
}
```

CrewLoop entries are identified by a command containing `crewloop-shim` inside the nested `hooks` array.

### Claude (`~/.claude/config.json`)

Same shape as Codex, with a top-level `"hooks"` object.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim claude --default-skill orchestrator"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim claude --default-skill orchestrator"
          }
        ]
      }
    ]
  }
}
```

### AGY (`~/.agy/config.json`)

Uses grouped object format. The top level is a map of hook-group names. Each group has event keys with arrays of matcher blocks, and each matcher block has a nested `hooks` array of command objects.

CrewLoop uses a dedicated group named `crewloop` to avoid colliding with user groups.

Example after installation:

```json
{
  "crewloop": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim agy --default-skill orchestrator"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim agy --default-skill orchestrator"
          }
        ]
      }
    ]
  }
}
```

## Delta summary

| Agent | Current format | Target format |
|-------|---------------|---------------|
| Kimi | `[hooks]` table with string keys | `[[hooks]]` array-of-tables |
| Codex | `hooks.before_tool_use` string | `hooks.PreToolUse[].matcher/hooks` |
| Claude | `hooks.before_tool_use` string | `hooks.PreToolUse[].matcher/hooks` |
| AGY | `hooks.before_tool_use` string | `crewloop.PreToolUse[].matcher/hooks` |

## Behavior rules

1. **Idempotency**: Re-running `crewloop install` must not duplicate CrewLoop hooks.
2. **User hook preservation**: Non-CrewLoop hooks must remain untouched.
3. **Old-format cleanup**: Old simplified CrewLoop entries must be removed and replaced with target-format entries.
4. **Backup**: A timestamped backup must be created before mutating an existing file.
5. **dry-run**: Must report the config path without writing.
6. **Matcher default**: All CrewLoop hooks use `matcher = "*"` to forward every tool-use event.

## Events

For dashboard parity, CrewLoop hooks attach to:

- `PreToolUse` — before a tool is invoked.
- `PostToolUse` — after a tool completes.

Future events (SessionStart, Stop, Notification, PermissionRequest) are deferred.
