# Spec Delta: CLI Auto-Configure Agent Hooks

## Current System State

`packages/cli/src/agents.ts` defines a static list of supported agents with only an `id` and a `skillsDir`:

```typescript
export interface AgentConfig {
  id: string;
  skillsDir: string;
}
```

The CLI uses this mapping to decide where to copy skills when `--agent <id>` is passed. It does not touch agent configuration files.

Dashboard integration examples are stored manually in:

- `servers/dashboard/config-examples/kimi-code-config.toml`
- `servers/dashboard/config-examples/codex-hooks.json`
- `servers/dashboard/config-examples/opencode-plugin/`

Users must copy these snippets into their agent config files themselves.

The root `AGENTS.md` still references `scripts/install.sh`, which was removed when the CLI became the sole installer (ADR 004).

## Changes

### ADDED: Per-agent hook metadata

- **File:** `packages/cli/src/agents.ts`
- **Change:** Extend `AgentConfig` with hook configuration metadata:

```typescript
export type HookFormat = 'toml' | 'json' | 'none';

export interface AgentHookConfig {
  supported: boolean;
  configPath: string;
  format: HookFormat;
  beforeToolUseCommand?: string;
  afterToolUseCommand?: string;
}

export interface AgentConfig {
  id: string;
  skillsDir: string;
  hooks: AgentHookConfig;
}
```

Initial mappings:

| Agent | skillsDir | hooks.configPath | hooks.format | before/after command |
|-------|-----------|------------------|--------------|----------------------|
| `kimi` | `~/.agents/skills` | `~/.kimi-code/config.toml` | `toml` | `crewloop-shim kimi` |
| `claude` | `~/.claude/skills` | `~/.claude/config.json` | `json` | `crewloop-shim claude` |
| `codex` | `~/.codex/skills` | `~/.codex/hooks.json` | `json` | `crewloop-shim codex` |
| `agy` | `~/.agy/skills` | `~/.agy/config.json` | `json` | `crewloop-shim agy` |
| `cursor` | `~/.cursor/rules` | — | `none` | unsupported |
| `windsurf` | `~/.windsurf/rules` | — | `none` | unsupported |

### ADDED: Hook config writer interface and implementations

- **File:** `packages/cli/src/hooks.ts` (new)
- **Change:** Define the writer contract:

```typescript
export interface HookWriterResult {
  agent: string;
  status: 'configured' | 'skipped' | 'unsupported' | 'error';
  configPath?: string;
  backupPath?: string;
  error?: Error;
}

export interface AgentHookConfigWriter {
  readonly agentId: string;
  isApplicable(): boolean;
  readConfig(): AgentHookConfigFile | undefined;
  writeConfig(config: AgentHookConfigFile): void;
  buildDefaultConfig(): AgentHookConfigFile;
  addHook(config: AgentHookConfigFile, hook: HookEntry): AgentHookConfigFile;
}

export function installHooksForAgent(
  agent: AgentConfig,
  options: { dryRun?: boolean; backup?: boolean }
): HookWriterResult;
```

Concrete writers:

- `KimiHookWriter` — reads/writes TOML, updates `[hooks]` table.
- `CodexHookWriter` — reads/writes JSON at `~/.codex/hooks.json`.
- `ClaudeHookWriter` — reads/writes JSON at `~/.claude/config.json`.
- `AgyHookWriter` — reads/writes JSON at `~/.agy/config.json`.

Each writer:

1. Checks whether the agent appears to be installed (config dir or skills dir exists).
2. Parses the existing config if present.
3. Adds `before_tool_use` and `after_tool_use` entries pointing to `crewloop-shim <agent>` if not already present.
4. Writes the updated config back.
5. Creates a backup (`<configPath>.crewloop-backup-<timestamp>`) before writing.

### ADDED: Hook installation orchestration

- **File:** `packages/cli/src/hooks.ts` (new)
- **Change:** Add `installHooks(options)` that iterates over `listSupportedAgents()` and calls `installHooksForAgent` for each agent whose `hooks.supported` flag is true.

### MODIFIED: CLI install command

- **File:** `packages/cli/src/cli.ts`
- **Change:**
  - Add `--hooks` and `--no-hooks` flags to `parseArgs`.
  - Default to `hooks: true`.
  - After skill installation and MCP installation, if `args.hooks !== false`, call `installHooks({ dryRun: args.dryRun, backup: true })`.
  - Print a summary block:

```
Configured agent hooks:
  ✓ kimi
  ✓ claude
  ✓ codex
  ✓ agy
```

Or, if an agent is not installed:

```
Configured agent hooks:
  ✓ kimi
  - claude (not installed)
  ✓ codex
  - agy (not installed)
```

### MODIFIED: AGENTS.md installation instructions

- **File:** `AGENTS.md`
- **Change:**
  - Remove references to `scripts/install.sh`.
  - Document that `crewloop install` automatically configures agent hooks.
  - Document `--no-hooks` for users who prefer manual configuration.
  - Update the repository structure section to match current `scripts/` contents.

### ADDED: Unit tests

- **File:** `packages/cli/src/tests/hooks.test.ts` (new)
- **Change:** Add tests for:
  - Idempotent TOML hook insertion.
  - Idempotent JSON hook insertion.
  - Backup creation before modification.
  - Dry-run does not write files.
  - Unsupported agents are skipped.
  - Missing agent directories result in `skipped` status.

## Acceptance Criteria

- `crewloop install` configures dashboard hooks for Kimi, Claude, Codex, and AGY by default.
- `crewloop install --no-hooks` skips hook configuration.
- Running `crewloop install` twice does not duplicate hook entries.
- Existing agent config files are backed up before modification.
- `--dry-run` previews hook changes without writing files.
- `AGENTS.md` no longer references `scripts/install.sh`.
- New unit tests cover idempotency, backups, and dry-run.
