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

`crewloop install` registers `before_tool_use` and `after_tool_use` hooks in each detected agent's config file. The hooks invoke:

```
crewloop-shim <agent> --default-skill orchestrator
```

The shim reads the agent payload from stdin, normalizes it to a `DashboardEvent`, and POSTs it to the dashboard at `http://127.0.0.1:7890/event`.

Use `--no-hooks` to skip hook configuration.

## Idempotency

Running `crewloop install` multiple times:

- Does not duplicate skill entries (existing skills are skipped unless `--force` is used).
- Does not duplicate hook entries.
- Creates a backup of an agent config file only when the file is actually modified.

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
