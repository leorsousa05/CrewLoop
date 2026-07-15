# Design: OpenCode Hook Support

## Overview

Add `opencode` as a supported agent in the CrewLoop CLI by introducing a new hook format (`plugin`) and a dedicated `OpenCodePluginWriter` that generates a JavaScript plugin file. The plugin registers `tool.execute.before` and `tool.execute.after` handlers, spawns `crewloop-shim opencode`, and pipes a JSON payload to the shim's stdin. The shim normalizes the payload into `DashboardEvent` objects and forwards them to the dashboard.

## Proposed Directory & File Structure

```
crewloop/
├── packages/
│   └── cli/
│       └── src/
│           ├── agents.ts                    (Modified — add opencode entry)
│           ├── hooks.ts                     (Modified — add OpenCodePluginWriter)
│           ├── cli.ts                       (Modified — update help text)
│           └── tests/
│               ├── hooks.test.ts            (Modified — add opencode tests)
│               └── agents.test.ts           (Modified — assert opencode config)
├── servers/
│   └── dashboard/
│       └── src/
│           └── adapters/
│               ├── shim.ts                  (Modified — add normalizeOpenCode)
│               └── shim.test.ts             (Modified — add opencode normalization tests)
└── specs/
    └── changes/
        └── 023-opencode-hook-support/       (New)
            ├── .spec.yaml
            ├── proposal.md
            ├── design.md
            └── tasks.md
```

## Code Architecture & Design Patterns

- **Architecture Model:** Modular by agent. The existing Strategy pattern (`AgentHookConfigWriter`) is extended with a new concrete strategy. No changes to the core `installHooks` orchestration.
- **Design Patterns Used:**
  - **Strategy** — `OpenCodePluginWriter` implements `AgentHookConfigWriter` alongside `KimiHookWriter`, `CodexHookWriter`, etc.
  - **Template Method** — The plugin file is generated from a template string with interpolated agent ID and shim path.
  - **Adapter** — `normalizeOpenCode` in the shim adapts the opencode plugin payload to the internal `DashboardEvent` contract.

## Data Model

```typescript
// packages/cli/src/agents.ts
export type HookFormat = 'toml' | 'json' | 'plugin' | 'none';

// New agent entry
{
  id: 'opencode',
  skillsDir: path.join(os.homedir(), '.config', 'opencode', 'skills'),
  hooks: {
    supported: true,
    configPath: path.join(os.homedir(), '.config', 'opencode', 'plugins', 'crewloop.js'),
    format: 'plugin',
    beforeToolUseCommand: 'crewloop-shim opencode --default-skill crewloop-hub',
    afterToolUseCommand: 'crewloop-shim opencode --default-skill crewloop-hub',
    lifecycleEvents: [], // opencode lifecycle events not wired in this iteration
  },
}
```

```typescript
// Payload sent from plugin → shim stdin
interface OpenCodePluginPayload {
  tool: string;
  event_type: 'tool_start' | 'tool_end';
  cwd?: string;
  success?: boolean;
  duration_ms?: number;
}
```

## API Contracts

```typescript
// packages/cli/src/hooks.ts
class OpenCodePluginWriter implements AgentHookConfigWriter {
  readonly agentId = 'opencode';
  isApplicable(): boolean;
  readConfig(): AgentHookConfigFile | undefined;
  writeConfig(config: AgentHookConfigFile): void;
  buildDefaultConfig(hooks: HookEntry[]): AgentHookConfigFile;
  syncHooks(config: AgentHookConfigFile, hooks: HookEntry[]): AgentHookConfigFile;
}
```

```typescript
// servers/dashboard/src/adapters/shim.ts
export function normalizeOpenCode(payload: OpenCodePluginPayload): DashboardEvent | undefined;
```

## Flow Diagrams

### Install Flow
1. `crewloop install` detects opencode (checks `~/.config/opencode/skills` or `~/.config/opencode` existence).
2. `OpenCodePluginWriter.isApplicable()` returns `true`.
3. Writer reads existing `~/.config/opencode/plugins/crewloop.js` if present.
4. If the file exists and contains the CrewLoop marker, it is compared with the generated template; if identical, skip.
5. If the file exists but does NOT contain the marker, back it up and overwrite.
6. If the file does not exist, create it.
7. CLI prints `✓ opencode (configured)`.

### Event Flow (runtime)
1. OpenCode loads `~/.config/opencode/plugins/crewloop.js` at startup.
2. Plugin registers `tool.execute.before` and `tool.execute.after` handlers.
3. On tool execution, the plugin builds `OpenCodePluginPayload` and spawns `crewloop-shim opencode`.
4. The shim reads stdin, calls `normalizeOpenCode(payload)`, then `buildEvent(...)`, then `postEvent(...)`.
5. Dashboard receives the event and displays it in the timeline.

## State Management

- **CLI:** No runtime state; the plugin file is a static artifact.
- **Plugin:** Stateless; each handler invocation spawns a new shim process.
- **Dashboard:** Existing session/state management; opencode events are treated identically to other agents.

## Error Handling

- **Plugin spawn failure:** `spawn` errors are swallowed (`stdio: 'ignore'`); opencode continues uninterrupted.
- **Shim payload parse failure:** Shim exits with code 0 without posting (existing behavior).
- **Dashboard unreachable:** Shim's `postEvent` already has a 300ms timeout and fails silently.
- **Malformed existing plugin:** Back up the file and overwrite with the correct template.

## Performance Considerations

- Plugin handlers must be non-blocking. `spawn` with detached stdio adds ~1-5ms overhead per tool call — acceptable for a local CLI tool.
- No caching or batching needed at this scale.

## Security Considerations

- The plugin file contains no secrets; it only constructs a local HTTP POST payload.
- The shim sanitizes tool inputs/outputs via `sanitize()` and `sanitizeToolPayload()` before forwarding.
- Backup files use the existing `.crewloop-backup-<timestamp>` suffix.

## Plugin Template

The generated `~/.config/opencode/plugins/crewloop.js` will look like:

```javascript
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

## Padrões Aplicados

- **Strategy** — `OpenCodePluginWriter` is a new strategy in the existing `AgentHookConfigWriter` family. This keeps the CLI extensible without modifying the orchestration logic.
- **Adapter** — `normalizeOpenCode` acts as an Anti-Corruption Layer between the opencode plugin event model and CrewLoop's internal `DashboardEvent` model.
- **Template Method** — The plugin file is generated from a deterministic template, ensuring consistent output across reinstalls.
- **Idempotência** — `syncHooks` compares the existing file content with the generated template; identical content triggers no write and no backup.

## Estratégia de Implementação

1. **Add `plugin` to `HookFormat`** in `agents.ts`.
2. **Add `opencode` entry** to `SUPPORTED_AGENTS` with `format: 'plugin'` and the correct paths.
3. **Implement `OpenCodePluginWriter`** in `hooks.ts` that generates the plugin template and manages idempotency/backup.
4. **Register the writer** in `createWriter` for `case 'opencode'`.
5. **Add `normalizeOpenCode`** in `shim.ts` to map the plugin payload to `DashboardEvent`.
6. **Update `detectSource` error message** to include `opencode`.
7. **Update CLI help text** in `cli.ts` to list `opencode`.
8. **Write tests** for plugin generation, idempotency, backup, and shim normalization.
9. **Update `packages/cli/AGENTS.md`** with the opencode plugin format documentation.
