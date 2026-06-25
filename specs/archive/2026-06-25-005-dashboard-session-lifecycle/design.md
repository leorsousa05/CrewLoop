# Design: Dashboard Session Lifecycle Improvements

## Architecture Overview

This change improves the dashboard's presentation layer without altering its event-driven core. The backend enriches session state with lifecycle metadata, and the frontend renders that metadata clearly. All changes are backward-compatible: older clients can ignore new fields.

### Patterns Used

- **State machine:** each session moves through `starting → running → ended`.
- **Progressive enhancement:** new fields are optional in the client protocol.
- **Accessibility-first motion:** animations are subtle and disabled for reduced-motion users.

## Directory Structure

```
servers/dashboard/
├── src/
│   ├── state.ts                         # MODIFIED: lifecycle and ended_at
│   ├── presenter.ts                     # MODIFIED: include lifecycle in client session
│   └── tests/
│       └── state.test.ts                # MODIFIED: lifecycle tests
└── public/
    ├── app.js                           # MODIFIED: render lifecycle badges, empty state
    └── styles.css                       # MODIFIED: lifecycle animations
```

## Core Components

### 1. `Session` lifecycle state

```typescript
// servers/dashboard/src/types.ts

export interface Session {
  id: string;
  source: AgentSource;
  active_skill?: string;
  active_confidence?: 'explicit' | 'heuristic' | 'unknown';
  status?: EventStatus;
  lifecycle: 'starting' | 'running' | 'ended';
  events: DashboardEvent[];
  tool_counts: Record<string, number>;
  started_at: number;
  last_event_at: number;
  ended_at?: number;
}
```

### 2. Lifecycle derivation

```typescript
// servers/dashboard/src/state.ts

function deriveLifecycle(event: DashboardEvent, session: Session): 'starting' | 'running' | 'ended' {
  if (event.event_type === 'session_end' || session.ended_at) {
    return 'ended';
  }
  if (event.event_type === 'session_start' && session.events.length <= 1) {
    return 'starting';
  }
  return 'running';
}
```

In `applyEvent`:

```typescript
if (event.event_type === 'session_end') {
  session.ended_at = event.timestamp;
}
session.lifecycle = deriveLifecycle(event, session);
```

### 3. Client session payload

```typescript
// servers/dashboard/src/presenter.ts

export function toClientSession(session: Session): ClientSession {
  return {
    id: session.id,
    source: session.source,
    skill: session.active_skill,
    activeSkill: session.active_skill
      ? { name: session.active_skill, confidence: session.active_confidence || 'unknown' }
      : undefined,
    status: session.status,
    lifecycle: session.lifecycle,
    events: session.events.map(toClientEvent),
    startTime: session.started_at,
    lastActivity: session.last_event_at,
    endedAt: session.ended_at,
    toolCounts: session.tool_counts,
  };
}
```

### 4. Frontend rendering

#### Lifecycle badge

```javascript
function renderLifecycle(session) {
  const lifecycle = session.lifecycle || 'starting';
  const label = lifecycle.toUpperCase();
  const className = `lifecycle-badge ${lifecycle}`;
  return `<span class="${className}">${label}</span>`;
}
```

#### Empty state

```javascript
function renderEmptyState() {
  activeSkillName.textContent = 'NO ACTIVE SESSION';
  activeSkillIcon.className = 'ph ph-moon';
  statusText.textContent = 'Start an agent session to see it here.';
  statusDot.className = 'status-dot';
}
```

#### Session selector enhancement

```javascript
function sessionSubtitle(session) {
  const start = formatTime(session.startTime);
  if (session.endedAt) {
    const duration = formatDuration(session.endedAt - session.startTime);
    return `${start} · ended after ${duration}`;
  }
  const duration = formatDuration(Date.now() - session.startTime);
  return `${start} · ${duration}`;
}
```

### 5. CSS animations

```css
@keyframes soft-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.lifecycle-badge.starting,
.status-dot.running {
  animation: soft-pulse 1.5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .lifecycle-badge.starting,
  .status-dot.running {
    animation: none;
  }
}
```

## Data Flow

```
Agent event arrives
  ↓
StateStore.applyEvent()
  ↓
deriveLifecycle() → 'starting' | 'running' | 'ended'
  ↓
presenter.toClientSession() includes lifecycle
  ↓
WebSocket broadcast
  ↓
app.js renderActiveSkill() shows lifecycle badge
```

## Contracts

```typescript
// servers/dashboard/src/types.ts

export interface Session {
  id: string;
  source: AgentSource;
  active_skill?: string;
  active_confidence?: 'explicit' | 'heuristic' | 'unknown';
  status?: EventStatus;
  lifecycle: 'starting' | 'running' | 'ended';
  events: DashboardEvent[];
  tool_counts: Record<string, number>;
  started_at: number;
  last_event_at: number;
  ended_at?: number;
}

export interface ClientSession {
  id: string;
  source: AgentSource;
  skill?: string;
  activeSkill?: ClientActiveSkill;
  status?: EventStatus;
  lifecycle: 'starting' | 'running' | 'ended';
  events: ClientEvent[];
  startTime: number;
  lastActivity: number;
  endedAt?: number;
  toolCounts: Record<string, number>;
}
```

## Test Plan

### Unit tests in `servers/dashboard/src/tests/state.test.ts`

- **Starting state:** new session from `session_start` has `lifecycle: 'starting'`.
- **Running state:** after a `tool_start` event, lifecycle becomes `'running'`.
- **Ended state:** after `session_end`, lifecycle is `'ended'` and `ended_at` is set.
- **Ended session stays ended:** subsequent tool events do not revert lifecycle.

### Manual tests

- Open the dashboard in a browser with no active session and verify the empty state.
- Start an agent session and verify the `STARTING` badge appears.
- Execute a tool and verify the badge changes to `RUNNING`.
- End the session and verify the badge changes to `ENDED`.
- Enable `prefers-reduced-motion` in the OS/browser and verify animations are disabled.

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Adding `lifecycle` to `Session` requires updating all test fixtures. | Low | Update tests alongside implementation. |
| CSS pulse animation may be distracting. | Low | Use low-amplitude opacity pulse; respect reduced motion. |
| Ended sessions remain in the list for 24 hours. | Low | Existing prune behavior unchanged; future spec may add explicit removal. |

## Deferred Items

- Manual "remove session" button is out of scope.
- Persistent session history is out of scope.
- Email / notification on session end is out of scope.
