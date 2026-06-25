# Spec Delta: Dashboard Session Lifecycle Improvements

## Current System State

The dashboard frontend (`servers/dashboard/public/app.js`) renders sessions with the following behavior:

- When no session exists, it shows `IDLE` status, a gray dot, and "waiting for events".
- When a session exists, it shows the active skill name, a status dot (`running`, `success`, `error`, or empty), and a confidence badge.
- The session selector shows only the session ID and source.
- There is no explicit "starting" state; the first event immediately creates a session with the active skill inferred from the event.
- `session_end` events set the session status to `success`, but the session remains visible until pruned after 24 hours.

The backend `StateStore` tracks:

- `started_at`: creation timestamp.
- `last_event_at`: timestamp of the most recent event.
- `status`: derived from the latest event type.

It does not track when a session ended or expose a high-level lifecycle label.

## Changes

### ADDED: Session lifecycle tracking in backend

- **File:** `servers/dashboard/src/state.ts`
- **Change:** Extend the `Session` interface and `StateStore` logic:
  - Add `ended_at?: number` to `Session`.
  - Add a derived `lifecycle: 'starting' | 'running' | 'ended'` field based on events.
  - Set `ended_at` when an event with `event_type === 'session_end'` is applied.
  - Keep `lifecycle` as `'starting'` until the first non-`session_start` event arrives.

```typescript
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

### MODIFIED: Presenter includes lifecycle fields

- **File:** `servers/dashboard/src/presenter.ts`
- **Change:** Include `lifecycle`, `startedAt`, `endedAt`, and `isEnded` in `ClientSession`.

```typescript
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

### MODIFIED: Frontend renders lifecycle states

- **File:** `servers/dashboard/public/app.js`
- **Change:**
  - Add a lifecycle badge next to the active skill name (`STARTING`, `RUNNING`, `ENDED`).
  - Use distinct colors:
    - `starting`: amber / pulse animation
    - `running`: cyan / pulse animation
    - `ended`: neutral / no animation
  - Show session start time in the session selector tooltip or subtitle.
  - Show total duration for ended sessions.
  - Improve the empty state with a friendly message and an illustration placeholder.

### MODIFIED: Empty state

- **File:** `servers/dashboard/public/app.js`
- **Change:** When no sessions exist, show:

```
No active session
Start an agent session to see it here.
```

Instead of the current `IDLE` / `waiting for events` text.

### ADDED: Subtle state-transition animations

- **File:** `servers/dashboard/public/app.js` and `public/styles.css`
- **Change:**
  - Add a CSS keyframe for a soft pulse on `starting` and `running` states.
  - Disable animations when `prefers-reduced-motion: reduce` is active.
  - Keep animations short (<= 1.5s loop) and low-motion.

### ADDED: Tests

- **File:** `servers/dashboard/src/tests/state.test.ts`
- **Change:** Add tests for:
  - New session has `lifecycle: 'starting'`.
  - First tool event changes lifecycle to `'running'`.
  - `session_end` event sets `lifecycle: 'ended'` and `ended_at`.
  - Pruning does not remove ended sessions before max age.

## Acceptance Criteria

- A new session appears in the dashboard with a `STARTING` badge.
- After the first tool event, the badge changes to `RUNNING`.
- After `session_end`, the badge changes to `ENDED` and the session stops pulsing.
- The session selector shows start time and duration.
- The empty state is friendly and informative.
- Animations respect `prefers-reduced-motion`.
- Existing tests continue to pass.
