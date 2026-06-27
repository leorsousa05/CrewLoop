# Design: Fix agent hook configuration formats

## Architecture

We keep the existing **Strategy** pattern: one `AgentHookConfigWriter` per agent format. The writer is responsible for parsing its agent's config format, identifying CrewLoop-managed hooks, and serializing the config back.

The high-level flow in `installHooksForAgent` stays the same:

1. Check if agent is supported.
2. Check if agent appears installed.
3. Read existing config (or none).
4. Synchronize the set of CrewLoop hooks.
5. Write config if changed.
6. Create backup if needed.

The key change is replacing `addHook` / `hasHook` with a single `syncHooks(config, hooks)` operation that removes old CrewLoop hooks and inserts new ones in the correct format.

## Directory structure

```
packages/cli/
├── src/
│   ├── agents.ts              # MODIFIED: agent metadata and commands
│   ├── hooks.ts               # MODIFIED: writers + install logic
│   └── tests/
│       └── hooks.test.ts      # MODIFIED: updated tests
├── AGENTS.md                  # NEW: agent hook format documentation
└── README.md                  # MAYBE MODIFIED: hook examples if present
```

## Contracts

### HookEntry

Internal representation of a single hook. Replaces the current `HookEntry` interface.

```typescript
export type AgentHookEvent = 'PreToolUse' | 'PostToolUse';

export interface HookEntry {
  event: AgentHookEvent;
  matcher: string;
  command: string;
  timeout?: number;
}
```

### AgentHookConfigWriter

Replaces `addHook` and `hasHook` with `syncHooks`.

```typescript
export interface AgentHookConfigWriter {
  readonly agentId: string;
  isApplicable(): boolean;
  readConfig(): AgentHookConfigFile | undefined;
  writeConfig(config: AgentHookConfigFile): void;
  buildDefaultConfig(hooks: HookEntry[]): AgentHookConfigFile;
  syncHooks(config: AgentHookConfigFile, hooks: HookEntry[]): AgentHookConfigFile;
}
```

### AgentConfig

`beforeToolUseCommand` and `afterToolUseCommand` are replaced by a list of event descriptors.

```typescript
export interface AgentHookConfig {
  supported: boolean;
  configPath: string;
  format: HookFormat;
  hooks: HookEntry[];
}
```

Or, if minimal change is preferred, keep `beforeToolUseCommand` / `afterToolUseCommand` and derive `HookEntry[]` in `installHooksForAgent`. The engineer may choose the smaller refactor.

### TOML representation (Kimi)

The `raw` field for TOML remains a string. The writer parses the string into:

```typescript
interface ParsedKimiHook {
  rawBlock: string;      // full [[hooks]] block as written
  event?: string;
  matcher?: string;
  command?: string;
  timeout?: number;
  isCrewLoop: boolean;
}
```

Algorithm:

1. Split content into segments: top matter + `[[hooks]]` blocks + other tables.
2. For each `[[hooks]]` block, parse `event`, `matcher`, `command`, `timeout`.
3. Mark `isCrewLoop = command.includes('crewloop-shim')`.
4. Rebuild content: keep non-CrewLoop blocks, append new CrewLoop blocks.
5. Preserve comments outside `[[hooks]]` blocks. Comments inside CrewLoop blocks are intentionally discarded because the block is regenerated.

### JSON representation (Codex / Claude / AGY)

The `raw` field for JSON remains a parsed object. Common structure:

```typescript
interface JsonMatcherBlock {
  matcher: string;
  hooks: JsonHookCommand[];
}

interface JsonHookCommand {
  type: 'command';
  command: string;
  timeout?: number;
  statusMessage?: string;
}
```

Common algorithm for Codex and Claude:

1. Ensure `config.hooks` exists as an object.
2. For each event (`PreToolUse`, `PostToolUse`):
   - Get the array `config.hooks[event]` or create it.
   - Remove matcher blocks whose nested `hooks` array contains only CrewLoop commands (command includes `crewloop-shim`).
   - Append a new matcher block with `matcher: "*"` and one `command` hook.

Algorithm for AGY:

1. Ensure `config.crewloop` exists as an object.
2. For each event (`PreToolUse`, `PostToolUse`):
   - Get the array `config.crewloop[event]` or create it.
   - Remove matcher blocks whose nested `hooks` array contains only CrewLoop commands.
   - Append a new matcher block with `matcher: "*"` and one `command` hook.

## Command string

The command passed to each hook remains:

```
crewloop-shim <agent-id> --default-skill orchestrator
```

The shim receives event context via stdin, which is the standard mechanism for agent hooks. Changing the command string to include the event name is deferred to avoid breaking the existing shim contract.

## Idempotency

A run is idempotent when:

- The config already exists.
- All expected CrewLoop hooks are present in the correct format.
- No old-format CrewLoop hooks remain.

When idempotent, `needsWrite` is false and no backup is created.

## Backup

Backups are created only when `needsWrite` is true and `options.backup` is true and the original file exists.

## Error handling

- Malformed JSON: return status `error` with parse message.
- Malformed TOML: return status `error` if parsing cannot continue safely. Because the TOML parser is minimal, invalid but readable files should be handled gracefully; unrecoverable files return `error`.

## Test plan

| Test | Why |
|------|-----|
| Kimi writes `[[hooks]]` blocks | Format correctness |
| Kimi idempotency | No duplication on reinstall |
| Kimi preserves user `[[hooks]]` | Non-intrusiveness |
| Kimi migrates old `[hooks]` table | Backward compatibility |
| Codex writes grouped JSON | Format correctness |
| Codex idempotency | No duplication |
| Codex preserves user hooks | Non-intrusiveness |
| Claude writes grouped JSON | Format correctness |
| AGY writes grouped JSON under `crewloop` | Format correctness + isolation |
| Backup created on modification | Safety |
| dry-run does not write | Safety |
| Unsupported agent returns `unsupported` | Existing behavior |
| Agent not installed returns `skipped` | Existing behavior |
| Malformed JSON returns `error` | Existing behavior |

## Risk assessment

| Risk | Mitigation |
|------|------------|
| Line-based TOML parser mishandles edge cases | Keep parser focused on `[[hooks]]` blocks; add tests for comments and nested tables. |
| Removing old CrewLoop hooks deletes user data | Only remove blocks where command includes `crewloop-shim`. |
| AGY group name collides with user group | Use `"crewloop"`; document that users should not use this key. |
| Command string change breaks shim | Keep command string unchanged; event context via stdin. |

## Patterns used

- **Strategy**: one writer per agent format.
- **Template Method**: shared JSON sync algorithm with small variations for path and group name.
- **Spec-Driven Development**: this spec is the source of truth.
