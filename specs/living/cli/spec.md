# Living Spec: CrewLoop CLI

## Purpose

The `crewloop` CLI is the single entry point for installing CrewLoop skills, starting the dashboard, and configuring agent hooks.

## Commands

| Command | Description |
|---------|-------------|
| `install` | Install CrewLoop skills and configure agent hooks |
| `list` | List available skills |
| `agents` | List supported agents, hook support, and config paths (read-only) |
| `doctor` | Diagnose package, dashboard, shim, and hook setup (read-only) |
| `dashboard` | Start the real-time skill dashboard |
| `version` | Show version |
| `help` | Show help message (`crewloop help <command>` for command-specific help) |

## Output and exit codes

Output is minimalist: no color, no emoji, no spinners. stdout carries successful results and help; stderr carries errors beginning with `error:`.

| Exit code | Meaning |
|-----------|---------|
| `0` | Success |
| `1` | Runtime failure or unknown command |
| `2` | Usage error: unknown flag, missing value, unexpected argument, invalid `--port` |

Parsing is strict: unknown commands, unknown flags, unexpected positional arguments, and partial/invalid `--port` values fail with actionable messages. Hook configuration errors during `install` return exit code `1`.

Default `install` output is summarized (`installed N skills to <dir>`, `hooks: X configured, Y skipped`, `next: crewloop dashboard`). `--verbose` restores per-skill and per-hook detail. `--dry-run` lines are prefixed with `dry-run:` and never write.

`doctor` prints stable lines prefixed with `ok`, `warn`, or `error` (error-level findings go to stderr; `ok`/`warn` stay on stdout) and returns non-zero only for error-level findings. Hook checks report marker presence (`present` / `not present`), not semantic validity. A missing `crewloop-shim` PATH entry is warn-level.

`doctor` also reports four layered optional DiamondBlock checks, never at error level and never affecting the exit code: `diamondblock skill` (present in the agent skill dir), `diamondblock binary` (`diamondblock`/`dblock` on PATH), `diamondblock installer` (bounded official `install --dry-run` preflight, exit-status only), and `diamondblock runtime` (guidance: activation is verified inside the agent by exposed MCP tools, never inferred from files). Doctor never parses or writes agent MCP config.

## DiamondBlock MCP integration (opt-in)

`crewloop install --diamondblock` is an explicit opt-in. Without the flag, install performs no DiamondBlock executable lookup or subprocess and behaves exactly as before.

- All MCP registration is delegated to the official DiamondBlock CLI (`diamondblock`, falling back to the `dblock` alias). CrewLoop never writes agent MCP configuration; backups and user-config preservation are the official installer's responsibility.
- With the flag, install locates the executable, then runs official `install --dry-run` preflight before any CrewLoop mutation. A missing executable or failed preflight exits `1` with an actionable message before skills/hooks are touched.
- `--agent <agent>` is forwarded as `--target <agent>` only when explicit; otherwise official auto-detection applies.
- `crewloop install --dry-run --diamondblock` is fully mutation-free: CrewLoop previews plus the official dry-run report only.
- In normal mode the official install runs after CrewLoop skills/hooks succeed. Its failure exits `1` and states that CrewLoop files may already be installed (partial state, no blind rollback).
- The subprocess adapter lives in `packages/cli/src/diamondblock.ts`: argument arrays only (`shell: false`), bounded output, injectable PATH lookup and executor, decisions from exit status only. Tests never spawn the real executable.

## Global binaries

Installing `@archznn/crewloop-skills` globally exposes:

- `crewloop` — main CLI (`packages/cli/bin/crewloop.js`)
- `crewloop-shim` — agent hook entry point (`servers/dashboard/bin/crewloop-shim.js`)

## Hooks

Supported agents: `kimi`, `claude`, `codex`, `agy`, `opencode`.

`crewloop install` registers `before_tool_use` and `after_tool_use` hooks in each detected agent's config file. The hooks invoke:

```
crewloop-shim <agent> --default-skill crewloop-hub
```

The shim reads the agent payload from stdin, normalizes it to a `DashboardEvent`, and POSTs it to the dashboard at `http://127.0.0.1:7890/event`.

Use `--no-hooks` to skip hook configuration.

## Idempotency

Running `crewloop install` multiple times:

- Does not duplicate skill entries (existing skills are skipped unless `--force` is used).
- Does not duplicate hook entries.
- Creates a backup of an agent config file only when the file is actually modified.

## Skill installation layout

Installed skills keep `SKILL.md` at the skill root for agent discovery. Shared CrewLoop files are isolated beneath the reserved `_crewloop/references/` and `_crewloop/assets/` namespace so they cannot overwrite skill-local `references/` or `assets/`.

Copy mode materializes both local and shared content. `--symlink` creates a real installed wrapper, materializes the rewritten `SKILL.md`, and links the remaining local payload entries and shared directories individually. The installer never mutates children through a whole-skill-directory symlink.

Existing installations adopt this layout through `crewloop install --force`.

## Help output

`crewloop -h` / `crewloop --help` shows:

- Command list with descriptions.
- A `Hooks:` section explaining supported agents and automatic registration.
- An `Examples:` section with common commands.
- All available options.

## Implementation notes

- The dispatcher lives in `packages/cli/src/cli.ts`; the strict parser lives in `src/args.ts`, help topics in `src/help.ts`, output formatting in `src/output.ts`, and command handlers in `src/commands/`.
- Hook config writers live in `packages/cli/src/hooks.ts`.
- Agent metadata lives in `packages/cli/src/agents.ts`.
- Shim normalization lives in `servers/dashboard/src/adapters/shim.ts`.
