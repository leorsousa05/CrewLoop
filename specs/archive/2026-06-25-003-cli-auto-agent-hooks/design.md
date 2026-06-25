# Design: CLI Auto-Configure Agent Hooks

## Architecture Overview

The CLI becomes a one-stop installer for both skills and dashboard instrumentation. The design separates agent detection, config parsing, and config mutation behind a small writer interface so that new agents can be added without changing the orchestration logic.

### Patterns Used

- **Strategy pattern:** each agent has its own `AgentHookConfigWriter`.
- **Adapter pattern:** writers translate the common `before_tool_use` / `after_tool_use` contract into agent-specific config formats.
- **Idempotency pattern:** writers check for existing equivalent entries before adding new ones.
- **Backup pattern:** existing config files are copied before mutation.

## Directory Structure

```
loop-engineering-agents/
├── AGENTS.md                            # MODIFIED: remove install.sh, document auto-hooks
├── packages/cli/src/
│   ├── agents.ts                        # MODIFIED: add hook metadata
│   ├── hooks.ts                         # NEW: writers and orchestration
│   ├── cli.ts                           # MODIFIED: parse --hooks/--no-hooks, call installHooks
│   └── tests/
│       └── hooks.test.ts                # NEW
└── servers/dashboard/config-examples/   # unchanged (still useful as reference)
```

## Core Components

### 1. `AgentConfig` extension

```typescript
// packages/cli/src/agents.ts

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

`listSupportedAgents()` continues to return copies, but now includes hook metadata.

### 2. `AgentHookConfigWriter` interface

```typescript
// packages/cli/src/hooks.ts

export interface HookEntry {
  event: 'before_tool_use' | 'after_tool_use';
  command: string;
}

export interface AgentHookConfigFile {
  path: string;
  format: HookFormat;
  raw: unknown;
}

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
  hasHook(config: AgentHookConfigFile, hook: HookEntry): boolean;
}
```

### 3. Concrete writers

#### `KimiHookWriter`

- **Config path:** `~/.kimi-code/config.toml`
- **Format:** TOML
- **Default config:**

```toml
[hooks]
before_tool_use = "crewloop-shim kimi"
after_tool_use = "crewloop-shim kimi"
```

- **Idempotency:** parses the `[hooks]` table and checks whether `before_tool_use` and `after_tool_use` already equal the target commands.
- **TOML parsing:** use a lightweight TOML parser or conservative string mutation. If no robust parser is available, mutate the file as text while preserving comments.

#### `CodexHookWriter`

- **Config path:** `~/.codex/hooks.json`
- **Format:** JSON
- **Default config:** matches `servers/dashboard/config-examples/codex-hooks.json`.
- **Idempotency:** check `hooks.before_tool_use` and `hooks.after_tool_use` for equivalent command/args.

#### `ClaudeHookWriter`

- **Config path:** `~/.claude/config.json`
- **Format:** JSON
- **Behavior:** follows the same shape as Codex if Claude's hook schema is JSON-based; otherwise adapts to the documented schema. The writer is pluggable to accommodate schema differences.

#### `AgyHookWriter`

- **Config path:** `~/.agy/config.json`
- **Format:** JSON
- **Behavior:** same pattern as Codex/Claude writers.

### 4. `installHooksForAgent`

```typescript
export function installHooksForAgent(
  agent: AgentConfig,
  options: { dryRun?: boolean; backup?: boolean }
): HookWriterResult
```

Algorithm:

1. If `agent.hooks.supported === false`, return `{ agent: agent.id, status: 'unsupported' }`.
2. Create a writer for the agent format.
3. If `writer.isApplicable()` is false (agent not installed), return `{ status: 'skipped' }`.
4. Read existing config with `writer.readConfig()`.
5. Build target config:
   - If no existing config, use `writer.buildDefaultConfig()`.
   - Otherwise, call `writer.addHook` for `before_tool_use` and `after_tool_use` if not already present.
6. If `options.dryRun`, return `{ status: 'configured' }` without writing.
7. If `options.backup` and the original file exists, copy it to `<path>.crewloop-backup-<timestamp>`.
8. Write the config with `writer.writeConfig()`.
9. Return `{ status: 'configured', configPath, backupPath }`.

### 5. `installHooks`

```typescript
export interface InstallHooksOptions {
  dryRun?: boolean;
  backup?: boolean;
  agents?: string[];
}

export function installHooks(options?: InstallHooksOptions): HookWriterResult[]
```

- Loads all supported agents via `listSupportedAgents()`.
- If `options.agents` is provided, filters to those IDs.
- Calls `installHooksForAgent` for each.
- Returns the list of results.

### 6. CLI integration

`parseArgs` gains:

```typescript
case '--hooks':
  result.hooks = true;
  break;
case '--no-hooks':
  result.hooks = false;
  break;
```

`handleInstall` calls:

```typescript
let hookResults: HookWriterResult[] = [];
if (args.hooks !== false) {
  hookResults = installHooks({ dryRun: args.dryRun, backup: true });
}
```

And prints:

```typescript
if (hookResults.length > 0) {
  console.log('Configured agent hooks:');
  for (const r of hookResults) {
    const symbol = r.status === 'configured' ? '✓' : r.status === 'error' ? '✗' : '-';
    const reason = r.error ? `error: ${r.error.message}` : `(${r.status})`;
    console.log(`  ${symbol} ${r.agent} ${reason}`);
  }
}
```

## Data Flow

```
crewloop install
  ↓
parseArgs() → { hooks: true }
  ↓
installSkills() → skill results
  ↓
installMcpServer() → MCP result
  ↓
installHooks({ dryRun, backup: true })
  ├─ KimiHookWriter → ~/.kimi-code/config.toml
  ├─ ClaudeHookWriter → ~/.claude/config.json
  ├─ CodexHookWriter → ~/.codex/hooks.json
  └─ AgyHookWriter → ~/.agy/config.json
  ↓
print hook summary
```

## Contracts

```typescript
// packages/cli/src/agents.ts

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

export function listSupportedAgents(): AgentConfig[];
export function resolveAgentDir(agentId?: string): string;
```

```typescript
// packages/cli/src/hooks.ts

export interface HookEntry {
  event: 'before_tool_use' | 'after_tool_use';
  command: string;
}

export interface AgentHookConfigFile {
  path: string;
  format: HookFormat;
  raw: unknown;
}

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
  hasHook(config: AgentHookConfigFile, hook: HookEntry): boolean;
}

export function installHooksForAgent(
  agent: AgentConfig,
  options?: { dryRun?: boolean; backup?: boolean }
): HookWriterResult;

export interface InstallHooksOptions {
  dryRun?: boolean;
  backup?: boolean;
  agents?: string[];
}

export function installHooks(options?: InstallHooksOptions): HookWriterResult[];
```

## Test Plan

### Unit tests in `packages/cli/src/tests/hooks.test.ts`

- **Kimi idempotency:** running `KimiHookWriter.addHook` twice on the same config does not duplicate the `[hooks]` entries.
- **JSON idempotency:** Codex writer does not duplicate `before_tool_use` / `after_tool_use` objects.
- **Backup creation:** `installHooksForAgent` creates a backup file when modifying an existing config.
- **Dry-run:** no files are written and result status is `configured`.
- **Unsupported agent:** `cursor` returns `unsupported` status.
- **Missing agent:** if neither config path nor skills dir exists, return `skipped`.
- **Error handling:** malformed JSON config returns `error` status without crashing.

### Manual tests

- Run `crewloop install --target /tmp/test` and verify `~/.kimi-code/config.toml` contains the hooks.
- Run `crewloop install` again and verify no duplicate entries.
- Run `crewloop install --no-hooks` and verify no config files are touched.
- Run `crewloop install --dry-run` and verify config files are not modified.

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Overwriting user-customized agent config. | Medium | Always back up before writing; idempotent insertion preserves other keys. |
| TOML parser adds a dependency. | Low | Prefer text mutation or a tiny inline parser; avoid heavy dependencies. |
| Claude/AGY hook schemas differ from assumptions. | Medium | Writers are isolated; schema adjustments are local to one writer. |
| Hook commands fail if `crewloop-shim` is not on PATH. | Medium | Document that `crewloop-shim` must be on PATH; future spec may expose binary wrapper. |

## Deferred Items

- OpenCode plugin installation is out of scope; it uses a different plugin model.
- Hook removal / uninstall is out of scope.
- Validating that hook commands actually execute is out of scope (depends on agent runtime).
