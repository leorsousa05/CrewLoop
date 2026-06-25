# Tasks: Dashboard Session Lifecycle Improvements

## Phase 1 — Backend lifecycle tracking

- [x] Add `lifecycle` and `ended_at` to `Session` interface in `servers/dashboard/src/types.ts`.
- [x] Implement `deriveLifecycle()` helper in `servers/dashboard/src/state.ts`.
- [x] Update `applyEvent()` to set `ended_at` on `session_end` and compute `lifecycle`.
- [x] Ensure new sessions default to `lifecycle: 'starting'`.

## Phase 2 — Presenter update

- [x] Update `toClientSession()` in `servers/dashboard/src/presenter.ts` to include `lifecycle` and `endedAt`.
- [x] Update any snapshot tests that compare client session shape.

## Phase 3 — Frontend rendering

- [x] Add lifecycle badge rendering in `servers/dashboard/public/app.js`.
- [x] Implement empty-state messaging when `state.sessions.size === 0`.
- [x] Add session start time and duration to session selector items.
- [x] Add lifecycle-based CSS classes to active skill card.

## Phase 4 — CSS animations

- [x] Add `soft-pulse` keyframe to `servers/dashboard/public/styles.css`.
- [x] Apply pulse to `starting` and `running` lifecycle badges / status dots.
- [x] Add `prefers-reduced-motion` media query to disable animations.

## Phase 5 — Tests

- [x] Add lifecycle state tests to `servers/dashboard/src/tests/state.test.ts`.
- [x] Add presenter tests if needed.
- [x] Run `npm test` in `servers/dashboard`.

## Phase 6 — Verification

- [x] Manual test: empty dashboard shows friendly message.
- [x] Manual test: new session shows `STARTING` badge.
- [x] Manual test: tool event changes badge to `RUNNING`.
- [x] Manual test: `session_end` changes badge to `ENDED`.
- [x] Manual test: reduced motion disables pulse animation.
