---
sidebar_position: 1
---

# CLI Reference

The `crewloop` command, shipped inside the `@archznn/crewloop-skills` package, is the TypeScript CLI that installs CrewLoop skills into your agent's skill directory and configures hooks so tool-use events are forwarded to the real-time dashboard.

## Install

```bash
npm install -g @archznn/crewloop-skills
```

## Commands

### `crewloop install`

Installs skills and configures agent hooks.

```bash
crewloop install
```

| Flag | Description |
|------|-------------|
| `--skill <name>` | Install only a specific skill directory (repeatable) |
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
crewloop install --skill crewloop-plan --skill crewloop-code --skill crewloop-review

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

### `crewloop validate-specs`

Validates the project's `specs/` tree against CrewLoop spec conventions (placement, frontmatter, required sections, acceptance-criteria mapping, links, and the 10-entry cap on `project-state.md` Recent decisions). Read-only; exits `0` when clean, `1` on errors, `2` on usage errors or a missing `specs/` folder.

```bash
crewloop validate-specs
crewloop validate-specs --changed specs/features/01-cli/spec-001-example.md
crewloop validate-specs --json
```

With `--changed`, only errors in the listed files fail; errors in other files, such as legacy specs, are reported as warnings. CrewLoop Plan, Review, and Ship run it automatically when the CLI is available.

## Supported agents

| Agent | Config path | Hook format |
|-------|------------|-------------|
| `kimi` | `~/.kimi-code/config.toml` | TOML `[[hooks]]` |
| `claude` | `~/.claude/config.json` | Grouped JSON |
| `codex` | `~/.codex/hooks.json` | Grouped JSON |
| `agy` | `~/.gemini/config/hooks.json` | Grouped JSON |
| `opencode` | `~/.config/opencode/plugins/crewloop.js` | JavaScript plugin |

## Hook identification

The CLI identifies its own hooks by the presence of `crewloop-shim` in the command string. It never removes hooks that do not contain `crewloop-shim`, so your existing agent configuration is always preserved.

## Source code

See [`packages/cli/AGENTS.md`](https://github.com/leorsousa05/CrewLoop/blob/main/packages/cli/AGENTS.md) for the internal architecture, hook formats per agent, and instructions for adding a new agent.
