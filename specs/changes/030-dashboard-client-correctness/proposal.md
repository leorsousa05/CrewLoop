# Proposal: Dashboard Client Correctness

## Status

- **State:** active
- **Created:** 2026-07-15
- **Author:** @opencode

## Problem Statement

Several visible controls do not govern runtime behavior: `maxEvents` is ignored, manual reduced motion affects only one component, and system theme does not react to OS changes. Recent panels select old events, filters omit declared dimensions or re-add hidden files, paused updates grow without bound, pruned sessions remain visible, and stale file responses can overwrite a newer selection.

## Goals

1. Make every exposed setting and filter match its documented effect.
2. Keep live updates bounded and deterministic during pause, reconnect, and pruning.
3. Prevent stale asynchronous file responses from corrupting visible selection.
4. Preserve ADR 003 hash routing and persisted settings.

## Non-Goals

- Visual redesign or overlay accessibility, owned by spec 031.
- Server event validation and adapter correlation, owned by spec 029.
- Timeline virtualization or server-side search.

## Constraints

- No router or state-management dependency.
- Existing localStorage settings migrate safely.
- URL remains the hydration source for route/session/filter/file state.
- UI limits cannot recover events already pruned by the server.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Settings migration resets preferences | Medium | Versioned defaults and migration tests |
| Coalescing loses meaningful intermediate updates | Medium | Retain latest update per session and latest snapshot |
| Filter semantics surprise existing users | Low | Align behavior with visible controls and living spec |
| Request cancellation masks real errors | Low | Distinguish abort from failure and retain retry behavior |

## Success Criteria

- [ ] Every visible filter changes the corresponding result set and count.
- [ ] `maxEvents`, reduced motion, system theme, and auto-follow behave as described.
- [ ] Paused update memory is bounded and resumes to the latest correct state.
- [ ] Pruned sessions disappear and selection falls back predictably.
- [ ] Rapid file selection never displays content under the wrong path.
