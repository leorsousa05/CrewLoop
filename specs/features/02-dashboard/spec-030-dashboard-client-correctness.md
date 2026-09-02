# spec-030-dashboard-client-correctness

---
name: spec-030-dashboard-client-correctness
domain: 02-dashboard
status: active
created: 2026-07-15
completed: null
supersedes: []
---

# Dashboard Client Correctness

## Objective

Make every exposed dashboard setting and filter govern its documented runtime behavior, keep live updates bounded/deterministic during pause, reconnect, and pruning, and prevent stale async file responses from corrupting visible selection.

## Context

- Dashboard UI: `shared/architecture-overview.md` §Dashboard (client views, navigation, filters).
- ADR 003 (hash routing + single registry), ADR 005 (local trust).
- Depends on spec 029 (event/session consistency) for protocol types.

## Requirements

1. Every visible setting and filter matches its documented effect: `maxEvents`, reduced motion, system theme, auto-follow, and all filter dimensions (query, tool, operation, status, source, skill, time).
2. Paused update memory is bounded (coalesced by session, snapshot replacement) and resumes to the latest correct state — never unbounded array replay.
3. Pruned sessions disappear from the UI and selection falls back deterministically.
4. Stale asynchronous file responses never display content under the wrong path (abort + identity guard).
5. WebSocket URL derives `ws:`/`wss:` from the page protocol.
6. Preserve ADR 003 hash routing and persisted settings; existing localStorage settings migrate safely.

## Behavior / Flow

1. Invocation projection is configurable via `settings.maxEvents` within server-retained bounds.
2. Recent panels and command palette select newest-first data correctly.
3. Session and Files filters apply all dimensions with count parity.
4. Session-removal messages (spec 029) remove sessions; selected-session fallback is deterministic and preserves explicit pinned/deep-linked choices.
5. Media-query subscriptions react to system theme/reduced-motion; manual reduced motion sets root-level effective-motion state.
6. File content/diff requests are abortable and tied to selected session/path/request generation.
7. Persisted settings are validated against versioned defaults; invalid values ignored.

## Constraints

- No router or state-management dependency.
- URL remains the hydration source for route/session/filter/file state.
- UI limits cannot recover events already pruned by the server.
- No visual redesign (spec 031 owns overlay accessibility), no server validation changes (spec 029), no timeline virtualization.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Settings migration resets preferences | Versioned defaults + migration tests |
| Coalescing loses meaningful intermediate updates | Retain latest update per session and latest snapshot |
| Filter semantics surprise existing users | Align behavior with visible controls; documented in living spec |
| Request cancellation masks real errors | Distinguish abort from failure; retain retry behavior |
| Rapid file selection | Out-of-order responses guarded by request identity; wrong-path display impossible |
| Pruned session is currently selected | Deterministic fallback; explicit selection preserved |
| Invalid persisted setting value | Ignored; defaults applied |
| Pause under rapid events | Bounded coalesced buffer; resume lands on latest correct state |

## Acceptance Criteria

- AC-01: Given the dashboard UI, changing any visible filter changes the corresponding result set and count.
- AC-02: Given `maxEvents`, reduced motion, system theme, and auto-follow settings, each governs runtime behavior as documented.
- AC-03: Given a paused session under rapid updates, memory stays bounded (coalesced) and resume shows the latest correct state.
- AC-04: Given a pruned session, it disappears from the UI and selection falls back predictably.
- AC-05: Given rapid file selection, content is never displayed under the wrong path (abort + identity guard verified by test).
- AC-06: Given the page served over HTTPS, the WebSocket URL uses `wss:`.
- AC-07: Given existing persisted settings, they migrate safely (versioned defaults, invalid values ignored).

## Done When

- [x] AC-01 — proven by filter tests covering source, query, tool, operation, status, and time behavior; Files reuses the same filtered projection and path matching.
- [x] AC-02 — proven by projection-limit, system-theme, reduced-motion, and settings-bound tests; runtime wiring applies maxEvents and effective motion to the dashboard root.
- [x] AC-03 — proven by bounded message-buffer tests covering coalesced updates, snapshot replacement, and update/remove ordering.
- [x] AC-04 — proven by deterministic session fallback tests and route cleanup when a selected session is removed.
- [x] AC-05 — proven by file request guard and loader tests covering identity changes, API failures, malformed/binary content, nullable diffs, and abort classification; component requests abort on cleanup and retry.
- [x] AC-06 — proven by protocol derivation tests for http/ws and https/wss.
- [x] AC-07 — proven by versioned settings envelope tests covering valid migration, legacy values, unknown versions, and invalid values.
