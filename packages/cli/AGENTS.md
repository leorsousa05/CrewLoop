# AGENTS.md — CrewLoop CLI

> Guide for AI agents working in `packages/cli/`. Read this file before changing hook installation, agent definitions, or the installer logic.

---

## What this package does

`@archznn/crewloop-cli` is the TypeScript CLI that installs CrewLoop skills into an agent's skill directory and configures agent-specific hooks so that tool-use events are forwarded to the CrewLoop dashboard.

Seven commands are exposed:

- `crewloop install` — copies skills to the agent's skill directory and writes hook configuration to the agent's config file.
- `crewloop list` — lists all available skills.
- `crewloop agents` — lists supported agents, hook support, and config paths (read-only).
- `crewloop doctor` — diagnoses package, dashboard, shim, and hook setup (read-only).
- `crewloop dashboard` — starts the dashboard server.
- `crewloop version` — prints the package version.
- `crewloop help [command]` — prints top-level or command-specific help.

---

## Source files at a glance

| File | Single responsibility |
|------|----------------------|
| `src/cli.ts` | Entry point — thin dispatcher, package-root resolution, exit-code normalization |
| `src/args.ts` | Strict argument parser — `CliOptions`, `CliUsageError`, `CliUnknownCommandError` |
| `src/help.ts` | Top-level and per-command help topics |
| `src/output.ts` | Output formatting — errors, pluralization, `~` path display |
| `src/commands/install.ts` | Install orchestration and summarized/verbose output |
| `src/commands/list.ts` | Skill list output |
| `src/commands/agents.ts` | Supported-agent table |
| `src/commands/doctor.ts` | Read-only diagnostics with injectable `DoctorContext` |
| `src/commands/dashboard.ts` | Dashboard startup |
| `src/agents.ts` | Supported agent definitions: config path, hook format, agent ID |
| `src/installer.ts` | Skill copy/install logic — copies SKILL.md files to the target directory |
| `src/hooks.ts` | Hook configuration — reads and writes agent config files using the Strategy pattern |
| `src/diamondblock.ts` | Official DiamondBlock CLI adapter — locates the executable, runs dry-run preflight, delegates install |
| `src/resolver.ts` | Path resolution utilities — resolves home dir, skill dirs, agent config paths |
| `src/tests/` | Test suite for parser, help, output, commands, hooks, installer, and agent definitions |

---

## Hook installation architecture

Hook configuration lives in `src/hooks.ts`. The design uses the **Strategy** pattern:

- `AgentHookConfigWriter` — interface every agent writer implements.
- `KimiHookWriter` — writes TOML `[[hooks]]` array-of-tables for Kimi Code.
- `GroupedJsonHookWriter` — shared base for agents that use grouped JSON hooks.
  - `CodexHookWriter` — writes to `~/.codex/hooks.json` under `"hooks"`.
  - `ClaudeHookWriter` — writes to `~/.claude/config.json` under `"hooks"`.
  - `AgyHookWriter` — writes to `~/.gemini/config/hooks.json` under `"crewloop"`.
- `OpenCodePluginWriter` — writes a JavaScript plugin file to `~/.config/opencode/plugins/crewloop.js`.

Agent metadata (config path, format, commands) is defined in `src/agents.ts`.

---

## Why formats differ

Each AI agent defines its own hook schema. CrewLoop must emit exactly the schema the agent understands. The formats are:

### Kimi Code (`~/.kimi-code/config.toml`)

Uses TOML array-of-tables. Each hook is a separate `[[hooks]]` block:

```toml
[[hooks]]
event = "PreToolUse"
matcher = ".*"
command = "crewloop-shim kimi --default-skill crewloop-hub"

[[hooks]]
event = "PostToolUse"
matcher = ".*"
command = "crewloop-shim kimi --default-skill crewloop-hub"
```

- `event` — when the hook fires (`PreToolUse`, `PostToolUse`).
- `matcher` — a JavaScript regular expression that matches against the tool name (`".*"` matches all tools).
- `command` — shell command the agent invokes.
- `timeout` — optional timeout in seconds.

### Codex (`~/.codex/hooks.json`) and Claude (`~/.claude/config.json`)

Uses a top-level `"hooks"` object. Each event maps to an array of matcher blocks, and each matcher block contains a nested `"hooks"` array of command objects:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim codex --default-skill crewloop-hub"
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
            "command": "crewloop-shim codex --default-skill crewloop-hub"
          }
        ]
      }
    ]
  }
}
```

### AGY (`~/.gemini/config/hooks.json`)

Uses grouped objects. The top level is a map of hook-group names. CrewLoop uses the `"crewloop"` group to avoid colliding with user groups:

```json
{
  "crewloop": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim agy --default-skill crewloop-hub"
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
            "command": "crewloop-shim agy --default-skill crewloop-hub"
          }
        ]
      }
    ]
  }
}
```

### OpenCode (`~/.config/opencode/plugins/crewloop.js`)

OpenCode does not use a static hook configuration file. Instead, it loads JavaScript plugins from `~/.config/opencode/plugins/`. CrewLoop writes a plugin file that registers `tool.execute.before` and `tool.execute.after` handlers. Each handler spawns `crewloop-shim opencode` and pipes a JSON payload to the shim's stdin.

```js
// CREWLOOP-PLUGIN v1 — do not edit; regenerate with `crewloop install`
const { spawn } = require('node:child_process');

function sendEvent(payload) {
  try {
    const child = spawn('crewloop-shim', ['opencode'], {
      stdio: ['pipe', 'ignore', 'ignore'],
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  } catch {
    // Never block opencode.
  }
}

export const CrewLoopPlugin = async () => {
  return {
    'tool.execute.before': async (input, output) => {
      sendEvent({
        tool: input.tool,
        event_type: 'tool_start',
        cwd: input.cwd,
      });
    },
    'tool.execute.after': async (input, output) => {
      sendEvent({
        tool: input.tool,
        event_type: 'tool_end',
        cwd: input.cwd,
        success: output?.success !== false,
        duration_ms: output?.duration,
      });
    },
  };
};
```

- **Marker comment**: `// CREWLOOP-PLUGIN v1` identifies the file as CrewLoop-owned. If an existing file lacks this marker, the CLI backs it up before overwriting.
- **Non-blocking**: The plugin spawns the shim with `stdio: ['pipe', 'ignore', 'ignore']` so opencode is never blocked by the dashboard.

---

## CrewLoop hook identification

When synchronizing hooks, the CLI must know which hooks it owns so it can overwrite them on reinstall without touching user hooks.

Rule: **a hook belongs to CrewLoop if its command string contains `crewloop-shim`.**

Apply this rule consistently:

- Kimi: inspect `command` inside each `[[hooks]]` block.
- JSON agents: inspect `command` inside each nested hook object.
- OpenCode: inspect the plugin file for the `// CREWLOOP-PLUGIN v1` marker comment.

Never remove a hook whose command does not contain `crewloop-shim`.

---

## Matcher behavior

- **Kimi Code**: `matcher` is compiled as a JavaScript regular expression. CrewLoop uses `".*"` so every tool-use event is forwarded to the dashboard. A bare `"*"` is an invalid regex and will never match.
- **Codex, Claude, AGY**: their grouped JSON formats use agent-specific matcher semantics; CrewLoop uses `"*"` as the catch-all per their documented behavior.

If you change a matcher, you risk losing events.

---

## Command string

The command passed to every CrewLoop hook is:

```
crewloop-shim <agent-id> --default-skill crewloop-hub
```

Example: `crewloop-shim kimi --default-skill crewloop-hub`.

The shim receives event context via stdin, which is the standard mechanism for agent hooks. Do not change this command string unless the shim contract is also updated.

---

## How to add or modify an agent hook format

1. Open `src/agents.ts` and add or update the agent entry with `configPath` and `format`.
2. Open `src/hooks.ts`:
   - If the agent uses TOML, create a writer that implements `AgentHookConfigWriter`.
   - If the agent uses grouped JSON, extend `GroupedJsonHookWriter` and set `rootKey`.
3. Register the writer in `createWriter`.
4. Add tests to `src/tests/hooks.test.ts` covering:
   - Correct target format.
   - Idempotency on reinstall.
   - User hook preservation.
   - Migration from old CrewLoop format if applicable.
5. Update this `AGENTS.md` with the new agent's format and config path.

---

## Legacy format cleanup

Older versions of the CLI wrote incorrect formats:

- Kimi: `[hooks]` table with `before_tool_use` / `after_tool_use` strings.
- JSON agents: `hooks.before_tool_use` / `hooks.after_tool_use` strings.
- AGY: `crewloop` block under `~/.agy/config.json` instead of `~/.gemini/config/hooks.json`.

The current writers detect these legacy entries by the `crewloop-shim` command and remove them before writing the correct format. For AGY, the installer also removes the stale `crewloop` block from `~/.agy/config.json`. This migration is idempotent.

---

## DiamondBlock adapter

`src/diamondblock.ts` is the adapter between CrewLoop install orchestration and the official DiamondBlock CLI. Its responsibilities:

- Locate the official executable (`diamondblock` first, then its `dblock` alias).
- Run the official `install --dry-run` preflight and, on success, the official `install`.
- Build argument arrays only — executable and arguments stay separate; never construct shell command strings.
- Trust the official installer's exit status for compatibility decisions, not stdout parsing.
- Accept injected dependencies (PATH lookup and process execution) so tests run with fakes.

MCP configuration is owned by the official DiamondBlock installer. CrewLoop never reads or writes agent MCP config — it only delegates through this adapter, and only when the user passes the explicit `crewloop install --diamondblock` opt-in.

---

## Testing hooks

Run the CLI test suite:

```bash
npm run build
npm test
```

Tests use temporary directories and do not touch real agent config files in the user's home directory.

---

## Conventions

- Keep `src/hooks.ts` focused on hook configuration only.
- Keep `src/installer.ts` focused on skill file copying only.
- Do not change skill installation logic in the same PR as hook format changes unless the spec explicitly requires it.
- Preserve user hooks at all times — never remove a hook that does not contain `crewloop-shim`.
- Always create a backup before mutating an existing config file.
- Use `src/resolver.ts` for all path resolution — do not hardcode paths.

---

## What agents should NOT do here

- **Do not modify `src/hooks.ts` and `src/installer.ts` in the same commit** unless the spec explicitly requires it — these are independent responsibilities.
- **Do not hardcode home directory paths** — use `src/resolver.ts`.
- **Do not use `"*"` as the Kimi matcher** — it is an invalid JavaScript regex. Use `".*"`.
- **Do not remove hooks that do not contain `crewloop-shim`** — those belong to the user.
- **Do not write to real agent config files in tests** — use temporary directories.
- **Do not parse or write agent MCP config in CrewLoop** — MCP configuration is owned by the official DiamondBlock installer; `src/diamondblock.ts` only delegates to it.
- **Do not spawn the real `diamondblock` binary in tests** — inject fakes for PATH lookup and process execution.
- **Do not run git operations** — use the Shipper skill.
- **Do not skip creating a spec** before making changes — even a 1-line fix needs a `.spec.yaml` + `tasks.md`.
