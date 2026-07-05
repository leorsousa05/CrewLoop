---
sidebar_position: 1
---

# CLI Reference

`@archznn/crewloop-cli` is the TypeScript CLI that installs CrewLoop skills into your agent's skill directory and configures hooks so tool-use events are forwarded to the real-time dashboard.

## Install

```bash
npm install -g @archznn/crewloop-cli
```

## Commands

### `crewloop install`

Installs skills and configures agent hooks.

```bash
crewloop install
```

| Flag | Description |
|------|-------------|
| `--skill <name>` | Install only a specific skill (repeatable) |
| `--agent <agent>` | Target a specific agent |
| `--target <dir>` | Install to a custom skills directory |
| `--symlink` | Create symlinks instead of copying files |
| `--force` | Overwrite existing skill files |
| `--dry-run` | Preview actions without writing anything |
| `-h, --help` | Show help |

**Examples:**

```bash
# Install all skills
crewloop install

# Install specific skills only
crewloop install --skill architect --skill engineer --skill reviewer

# Install for a specific agent
crewloop install --agent claude

# Preview without installing
crewloop install --dry-run

# Install to a custom directory
crewloop install --target ~/.config/my-agent/skills
```

### `crewloop list`

Lists all available skills.

```bash
crewloop list
```

### `crewloop dashboard`

Starts the real-time skill dashboard.

```bash
crewloop dashboard
crewloop dashboard --port 8080
crewloop dashboard --host 0.0.0.0
```

## Supported agents

| Agent | Config path | Hook format |
|-------|------------|-------------|
| `kimi` | `~/.kimi-code/config.toml` | TOML `[[hooks]]` |
| `claude` | `~/.claude/config.json` | Grouped JSON |
| `codex` | `~/.codex/hooks.json` | Grouped JSON |
| `agy` | `~/.gemini/config/hooks.json` | Grouped JSON |

## Hook identification

The CLI identifies its own hooks by the presence of `crewloop-shim` in the command string. It never removes hooks that do not contain `crewloop-shim`, so your existing agent configuration is always preserved.

## Source code

See [`packages/cli/AGENTS.md`](https://github.com/leorsousa05/CrewLoop/blob/main/packages/cli/AGENTS.md) for the internal architecture, hook formats per agent, and instructions for adding a new agent.
