# Living Spec: CLI Hook Installation

> Current source of truth for how `crewloop install` configures agent hooks.

## Supported agents and formats

### Kimi Code (`~/.kimi-code/config.toml`)

TOML array-of-tables (`[[hooks]]`). Each hook is a separate block:

```toml
[[hooks]]
event = "PreToolUse"
matcher = ".*"
command = "crewloop-shim kimi --default-skill orchestrator"

[[hooks]]
event = "PostToolUse"
matcher = ".*"
command = "crewloop-shim kimi --default-skill orchestrator"
```

### Codex (`~/.codex/hooks.json`) and Claude (`~/.claude/config.json`)

JSON with top-level `"hooks"` object. Each event maps to an array of matcher blocks, and each matcher block contains a nested `"hooks"` array of command objects:

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

### AGY (`~/.gemini/config/hooks.json`)

JSON grouped object format. CrewLoop uses the `"crewloop"` group to isolate its hooks from user groups:

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

## Behavior rules

- **Idempotency**: Re-running `crewloop install` does not duplicate CrewLoop hooks.
- **User hook preservation**: Non-CrewLoop hooks are never removed.
- **Old-format cleanup**: Legacy simplified CrewLoop entries are removed and replaced with the current format. For AGY, the legacy `~/.agy/config.json` file is also cleaned up.
- **Backup**: A timestamped backup is created before mutating an existing file.
- **dry-run**: Reports the config path without writing.
- **Matcher default**: CrewLoop uses a catch-all matcher for every agent. Kimi Code compiles `matcher` as a JavaScript regular expression, so CrewLoop emits `".*"` for Kimi. JSON-based agents (Codex, Claude, AGY) keep their agent-specific `"*"` catch-all.
- **Identification rule**: A hook belongs to CrewLoop if its command contains `crewloop-shim`.

## Implementation notes

- Writers live in `packages/cli/src/hooks.ts`.
- Agent metadata lives in `packages/cli/src/agents.ts`.
- `KimiHookWriter` parses and emits TOML `[[hooks]]` blocks.
- `GroupedJsonHookWriter` is the shared base for Codex, Claude, and AGY.
- `AGENTS.md` in `packages/cli/` documents formats and maintenance rules.
