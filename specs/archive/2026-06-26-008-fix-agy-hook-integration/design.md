# Design: Fix AGY Hook Integration

## Architecture

The change spans two bounded contexts:

1. **CLI installation** (`packages/cli`) — owns where hooks are written.
2. **Dashboard ingestion** (`servers/dashboard`) — owns how hook payloads are normalized and displayed.

Both contexts share the contract that `crewloop-shim agy --default-skill orchestrator` is the command AGY invokes. The CLI ensures the command is registered in the right file; the dashboard ensures the command is understood when it runs.

### Patterns

- **Adapter pattern** — each agent source has its own adapter (`kimi.ts`, `codex.ts`, `agy.ts`). AGY-specific normalization is isolated from the generic shim and state logic.
- **Strategy pattern** — `SkillInferenceEngine` remains source-agnostic; it receives a normalized `DashboardEvent` and applies the same rules regardless of origin.
- **Deterministic ID pairing** — AGY pre/post events are matched by a stable id derived from `conversationId` + `stepIdx`, avoiding the need for the post event to repeat the tool name.

## Contracts

### CLI

```typescript
// packages/cli/src/agents.ts
export interface AgentHookConfig {
  supported: boolean;
  configPath: string;
  format: HookFormat;
  beforeToolUseCommand?: string;
  afterToolUseCommand?: string;
}
```

Only the `configPath` for the `agy` agent changes.

### Dashboard types

```typescript
// servers/dashboard/src/types.ts
export type AgentSource = 'kimi' | 'codex' | 'opencode' | 'log-watcher' | 'agy';
```

No other type changes.

### AGY adapter

```typescript
// servers/dashboard/src/adapters/agy.ts
export interface AgyHookPayload {
  hook_event_name?: string;
  conversationId?: string;
  sessionId?: string;
  session_id?: string;
  toolCall?: {
    name?: string;
    args?: Record<string, unknown>;
  };
  toolName?: string;
  stepIdx?: number;
  error?: string;
  workspacePaths?: string[];
  transcriptPath?: string;
  artifactDirectoryPath?: string;
}

export function normalizeAgy(payload: AgyHookPayload): DashboardEvent | undefined;
```

The adapter accepts loose optional fields to tolerate minor payload differences between AGY versions.

### Shim routing

```typescript
// servers/dashboard/src/adapters/shim.ts
export function detectSource(argv: string[]): AgentSource | undefined;
export function normalizePayload(source: AgentSource, raw: unknown): DashboardEvent | undefined;
```

`detectSource` adds `'agy'`. `normalizePayload` adds a case for `agy` calling `normalizeAgy`.

### Invocation pairing

```typescript
// servers/dashboard/src/lib/invocations.ts
export function projectInvocations(events: ClientEvent[]): ToolInvocation[];
```

Algorithm change: pair by `event.id` first, then by tool name stack.

## Data Flow

1. User runs `crewloop install`.
2. CLI detects AGY is installed (`~/.agy/skills` exists).
3. CLI writes hooks to `~/.gemini/config/hooks.json` under the `crewloop` group.
4. CLI removes any stale `crewloop` block from `~/.agy/config.json`.
5. AGY executes a tool.
6. AGY invokes `crewloop-shim agy --default-skill orchestrator` for `PreToolUse` and `PostToolUse`.
7. `crewloop-shim` detects source `agy`, reads JSON from stdin, and calls `buildEvent`.
8. `normalizeAgy` converts the payload to `DashboardEvent` with deterministic id.
9. `postEvent` sends the event to `POST /event` on the dashboard.
10. `StateStore.applyEvent` stores the event.
11. `projectInvocations` pairs pre/post events by id and renders the timeline.

## File Structure

```
packages/cli/
└── src/
    ├── agents.ts                    # MODIFY: AGY configPath
    ├── hooks.ts                     # MODIFY: legacy cleanup for ~/.agy/config.json
    └── tests/
        └── hooks.test.ts            # MODIFY: AGY path expectations + cleanup tests

servers/dashboard/
└── src/
    ├── types.ts                     # MODIFY: add 'agy' to AgentSource
    ├── adapters/
    │   ├── shim.ts                  # MODIFY: detect/route 'agy'
    │   ├── agy.ts                   # NEW: AGY payload adapter
    │   ├── kimi.ts                  # no change
    │   └── codex.ts                 # no change
    ├── lib/
    │   └── invocations.ts           # MODIFY: pair by id first
    └── tests/
        ├── adapters.test.ts         # MODIFY/NEW: AGY adapter tests
        └── shim.test.ts             # MODIFY: AGY source detection tests

specs/living/
├── cli/hooks.md                   # MODIFY: AGY path
└── dashboard/spec.md              # MODIFY: AGY source + adapter docs
```

## Key Trade-offs

- **Deterministic id pairing vs. adding a `stepIdx` field.** We chose deterministic ids because it avoids changing the `DashboardEvent` / `ClientEvent` contracts and keeps AGY-specific logic inside the adapter.
- **Tool name normalization vs. raw AGY names.** We normalize common AGY tools to the internal names used by Kimi so that existing skill inference and file-activity heuristics keep working without source-specific branches.
- **Legacy cleanup in CLI vs. leaving stale file.** Removing the stale `~/.agy/config.json` block prevents AGY from accidentally loading CrewLoop hooks from the wrong path if a future AGY version starts reading it.

## Risks

- AGY payload schema may change in future versions. The adapter uses optional fields, so minor additions should not break it.
- If AGY starts supporting `PreInvocation` / `PostInvocation`, those events will be ignored until explicitly added.
- Pairing by id assumes AGY sends the same `conversationId` + `stepIdx` for pre and post. The doc indicates it does.
