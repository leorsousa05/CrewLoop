# Design: Dashboard Client Correctness

## Overview

Keep React state ownership intact but replace implicit, duplicated behavior with pure projection functions and bounded live-update state. Asynchronous file loading gains request identity and cancellation. Effective settings are projected once in `SettingsContext` and applied through root attributes/classes.

## Proposed Directory & File Structure

```text
servers/dashboard/ui/src/
├── App.tsx                         (Modified: bounded update coordination)
├── contexts/SettingsContext.tsx   (Modified: reactive effective settings)
├── hooks/
│   ├── useSessions.ts             (Modified: remove/fallback behavior)
│   └── useWebSocket.ts            (Modified: protocol/reconnect contract)
├── lib/
│   ├── filter.ts                  (Modified: complete semantics)
│   ├── filter.test.ts             (Modified)
│   ├── pending-updates.ts         (New: pure coalescer)
│   ├── pending-updates.test.ts    (New)
│   └── settings.ts                (Modified: validation/migration)
└── components/
    ├── FileDiff.tsx               (Modified: abort/request identity)
    └── views/{Overview,FilesView,SettingsView}.tsx (Modified)
servers/dashboard/src/lib/invocations.ts (Modified: configurable projection)
```

## Code Architecture & Design Patterns

- **Projection Model:** pure helpers derive visible invocations, filters, and recent data from canonical session state.
- **Latest-Value Coalescing:** paused updates retain the newest state per session instead of replaying every full snapshot.
- **Cancellation:** each file-selection effect owns an `AbortController`; cleanup invalidates previous work.
- **Single Source of Truth:** `SettingsContext` owns resolved theme and effective motion state.

## Data Model

```typescript
interface PendingUpdateState {
  snapshot?: ClientSnapshotMessage;
  updatesBySession: Map<string, ClientUpdateMessage>;
  removals: Set<string>;
}

interface EffectiveSettings {
  theme: 'dark' | 'light';
  reducedMotion: boolean;
  maxEvents: number;
  autoFollowActive: boolean;
}
```

## API Contracts

```typescript
function projectInvocations(events: ClientEvent[], maxEvents: number): ToolInvocation[];
function coalesceMessage(state: PendingUpdateState, message: ClientWebSocketMessage): PendingUpdateState;
function flushMessages(state: PendingUpdateState): ClientWebSocketMessage[];
function filterSessions(sessions: ClientSession[], filters: FilterState, pins: PinnedSession[], now: number): ClientSession[];
function createDashboardWebSocketUrl(location: Pick<Location, 'protocol' | 'host'>): string;
```

## Flow Diagrams

### Paused Updates

1. Snapshot replaces all pending update state.
2. Update replaces the previous pending update for the same session.
3. Remove deletes a pending update and records removal.
4. Resume applies snapshot, removals, and latest updates in deterministic order.

### File Selection

1. Session/path/view mode change aborts the previous request.
2. New request captures its identity and enters loading state.
3. Only the current non-aborted request may publish content, diff, or error.
4. Abort is silent; a real failure exposes Retry for the same identity.

## State Management

Server snapshots remain canonical. URL route remains navigation canonical. Contexts own settings/filters/pins, while bounded pending updates are transient App state. No global store is added.

## Error Handling

Invalid stored settings fall back per field. Aborted fetches do not show errors. WebSocket removal of the selected session chooses the newest eligible session or the empty state without writing an invalid route.

## Performance Considerations

Coalescing bounds pause memory by session count. Filter/projection functions remain linear in retained events. Media-query listeners are registered once and cleaned up.

## Security Considerations

The client never derives filesystem authorization. URL inputs remain validated by route parsing, and server errors are rendered without unsafe HTML.
