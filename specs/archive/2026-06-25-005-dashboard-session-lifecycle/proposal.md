# Proposal: Dashboard Session Lifecycle Improvements

## WHY

The dashboard currently displays sessions as a flat list with limited state information. When a session starts, the UI jumps from "IDLE" to the active skill name with no intermediate "starting" state. When a session ends, it disappears only after the 24-hour prune window. The user asked to "melhorar o dashboard inclusive," so this change makes the session lifecycle explicit and visually clear:

- A distinct "starting" state when a session is first created.
- A clear "running" state while tools are executing.
- A terminal "ended" / "success" / "error" state after `session_end`.
- Better empty-state messaging when no agent is connected.
- Session start time and total duration displayed in the session selector.

## Scope

- Extend `servers/dashboard/src/state.ts` to track `ended_at` and a computed `lifecycle` state for each session.
- Update `servers/dashboard/src/presenter.ts` to include lifecycle fields in client messages.
- Update `servers/dashboard/public/app.js` to render lifecycle badges, start time, and duration.
- Improve the empty state and the "waiting for events" message.
- Add subtle micro-animations for state transitions, respecting `prefers-reduced-motion`.
- Keep the existing minimal visual style.

## Constraints

- No new backend dependencies.
- No changes to the WebSocket message schema beyond adding optional fields.
- Must remain compatible with clients that ignore new fields.
- Animations must respect `prefers-reduced-motion`.
