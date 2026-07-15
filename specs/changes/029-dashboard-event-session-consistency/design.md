# Design: Dashboard Event and Session Consistency

## Overview

Treat adapter output as untrusted input to a canonical event boundary. Parse first, preserve workspace metadata, normalize payload paths, then apply one state transition. Invocation identity is separate from event identity: each start/end event remains unique while related events share `invocation_id`.

## Proposed Directory & File Structure

```text
servers/dashboard/src/
├── types.ts                         (Modified: invocation and remove contracts)
├── api/event.ts                     (Modified: parse/normalize pipeline)
├── state.ts                         (Modified: deterministic transitions and cleanup)
├── presenter.ts                     (Modified: invocation ID and remove messages)
├── lib/
│   ├── event-schema.ts              (New: runtime parser)
│   ├── event-schema.test.ts         (New)
│   ├── event-paths.ts               (New: payload-only path normalization)
│   └── invocations.ts               (Modified: correlation-first pairing)
└── adapters/
    ├── agy.ts                       (Modified)
    ├── claude.ts                    (Modified)
    ├── codex.ts                     (Modified)
    ├── kimi.ts                      (Modified)
    ├── opencode.ts                  (Modified)
    ├── shim.ts                      (Modified)
    └── *.test.ts                    (Modified: contract fixtures)
packages/cli/src/hooks.ts             (Modified: OpenCode payload contract)
```

## Code Architecture & Design Patterns

- **Anti-Corruption Layer:** adapters translate native payloads, but the runtime parser owns canonical validity.
- **Value Object:** `invocation_id` identifies one tool operation independently from event IDs.
- **State Machine:** session lifecycle transitions are explicit for start, activity, end, idle end, resume, and prune.
- **Observer Protocol:** state updates and removals are projected as typed WebSocket messages.

## Data Model

```typescript
interface DashboardEvent {
  id: string;
  invocation_id?: string;
  timestamp: number;
  source: AgentSource;
  session_id: string;
  event_type: EventType;
  workspacePath?: string;
}

interface ClientRemoveMessage {
  type: 'remove';
  sessionId: string;
}

type SessionTransition =
  | 'create'
  | 'start'
  | 'activity'
  | 'end'
  | 'idle-end'
  | 'resume'
  | 'prune';
```

## API Contracts

```typescript
type EventParseResult =
  | { ok: true; event: DashboardEvent }
  | { ok: false; code: EventValidationCode; message: string };

function parseDashboardEvent(input: unknown): EventParseResult;
function normalizeEventPayloadPaths(event: DashboardEvent, root: string): DashboardEvent;
function createRemoveMessage(sessionId: string): ClientRemoveMessage;
function projectInvocations(events: ClientEvent[], maxEvents: number): ToolInvocation[];
```

## Flow Diagrams

### Event Ingestion

1. Read a bounded JSON value under spec 028.
2. Reject unsafe keys and parse the canonical schema.
3. Copy the absolute `workspacePath` as metadata; normalize only display/payload path values.
4. Sanitize secret-bearing values and classify operation type.
5. Apply one session transition and infer skill.
6. Broadcast one typed update; do not mark ended sessions active.

### Invocation Pairing

1. Pair start/end by `invocation_id` when both provide it.
2. Pair by equal event ID only for adapters whose documented contract guarantees it.
3. Use a same-tool stack only as a legacy best-effort fallback.
4. Preserve unmatched starts/ends as explicit rows instead of silently attaching output incorrectly.

## State Management

`StateStore` remains authoritative. Explicit new activity after terminal state follows the defined resume transition, clears `ended_at`, updates lifecycle/status, and preserves historical events. Pruning returns removed session IDs and deletes their root mappings.

## Error Handling

Invalid events return 400 without state mutation or broadcast. Mapping persistence failures are observable server errors but do not corrupt in-memory state; writes use a replace-safe strategy.

## Performance Considerations

Validation bounds breadth/depth under spec 028 limits. Correlation maps are linear in retained events. Cleanup removes stale runtime mappings alongside sessions.

## Security Considerations

The parser rejects prototype-pollution keys and invalid path metadata. Absolute workspace roots remain server-side and only relative event paths are presented to clients.
