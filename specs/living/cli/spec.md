# Living Spec: CrewLoop CLI

## Purpose

The `crewloop` CLI is the single entry point for installing CrewLoop skills, starting the dashboard, and configuring agent hooks.

## Commands

| Command | Description |
|---------|-------------|
| `install` | Install CrewLoop skills and configure agent hooks |
| `list` | List available skills |
| `dashboard` | Start the real-time skill dashboard |
| `version` | Show version |
| `help` | Show help message |

## Global binaries

Installing `@archznn/crewloop-skills` globally exposes:

- `crewloop` — main CLI (`packages/cli/bin/crewloop.js`)
- `crewloop-shim` — agent hook entry point (`servers/dashboard/bin/crewloop-shim.js`)

## Hooks

Supported agents: `kimi`, `claude`, `codex`, `agy`.

`crewloop install` registers agent-specific hooks for every supported agent, even when the agent's config directory does not yet exist. The hooks invoke:

```
crewloop-shim <agent> --default-skill orchestrator
```

The exact event names depend on the agent:

- **Kimi, Codex, AGY:** `PreToolUse` / `PostToolUse`
- **Claude:** `before_tool_use` / `after_tool_use`

For Claude, hooks are written as flat objects:

```json
{
  "hooks": {
    "before_tool_use": {
      "command": "crewloop-shim",
      "args": ["claude", "--default-skill", "orchestrator"]
    }
  }
}
```

For Codex, hooks follow the documented matcher-array group format:

- Codex config: `~/.codex/hooks.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim",
            "args": ["codex", "--default-skill", "orchestrator"]
          }
        ]
      }
    ]
  }
}
```

For AGY, hooks also use matcher-array groups, but with a single command string and an explicit event-type override:

- AGY config: `~/.gemini/config/hooks.json`
- Backup/secondary path used by some AGY builds: `~/.gemini/antigravity-cli/hooks.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node C:/Users/guilh/codes/crewloop/servers/dashboard/bin/crewloop-shim.js agy --default-skill orchestrator --event-type tool_start",
            "timeout": 10
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
            "command": "node C:/Users/guilh/codes/crewloop/servers/dashboard/bin/crewloop-shim.js agy --default-skill orchestrator --event-type tool_end",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

For Kimi, hooks are written as TOML array-of-tables:

```toml
[[hooks]]
event = "PreToolUse"
command = "crewloop-shim kimi --default-skill orchestrator"

[[hooks]]
event = "PostToolUse"
command = "crewloop-shim kimi --default-skill orchestrator"
```

The shim reads the agent payload from stdin, normalizes it to a `DashboardEvent`, and POSTs it to the dashboard at `http://127.0.0.1:7890/event`.

Use `--no-hooks` to skip hook configuration.

### AGY payload normalization

The AGY payload does not include a `hook_event_name` field, so the shim relies on the `--event-type` argument passed in the hook command. The dashboard shim reads:

- `session_id` from `sessionId`, `session_id`, or `conversationId`.
- `tool` from `toolName` or `toolCall.name`.

## Idempotency

Running `crewloop install` multiple times:

- Does not duplicate skill entries (existing skills are skipped unless `--force` is used).
- Does not duplicate hook entries.
- Upgrades legacy string-format JSON hooks to the object format.
- Upgrades legacy flat-object Codex hooks to the documented matcher-array group format.
- Removes the legacy Kimi `[hooks]` table and replaces it with `[[hooks]]` array-of-tables.
- Removes legacy event-name entries (e.g. `before_tool_use` / `after_tool_use` in Kimi/Codex) when the agent has changed its hook names.
- Creates a backup of an agent config file only when the file is actually modified.

## Known issues

### Codex on Windows: sandbox helper not found

When Codex is installed via the standalone PowerShell installer on Windows, the normal launcher entrypoint may fail to locate the Windows sandbox helper (`codex-windows-sandbox-setup.exe`). This causes Codex hooks to fail before `crewloop-shim` runs, so the dashboard receives no Codex events.

Run `crewloop doctor` to detect this. Workarounds:

- Launch Codex from the package binary: `%USERPROFILE%\.codex\packages\standalone\current\bin\codex.exe`
- Or prepend the resource directory to `PATH`: `%USERPROFILE%\.codex\packages\standalone\current\codex-resources`

This is an upstream Codex issue; see <https://github.com/openai/codex/issues/28457> for context.

## Help output

`crewloop -h` / `crewloop --help` shows:

- Command list with descriptions.
- A `Hooks:` section explaining supported agents and automatic registration.
- An `Examples:` section with common commands.
- All available options.

## Implementation notes

- Hook config writers live in `packages/cli/src/hooks.ts`.
- Agent metadata lives in `packages/cli/src/agents.ts`.
- Shim normalization lives in `servers/dashboard/src/adapters/shim.ts`.
- The Obsidian MCP server is installed/ensured during `crewloop install` when the `servers/obsidian-mcp` directory is present.
