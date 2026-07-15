# Tasks: Dashboard Client Correctness

## Setup

- [x] Create the full spec folder and dependency on spec 029.
- [ ] Confirm protocol types from spec 029 are merged before implementation.

## Implementation

- [ ] Parameterize invocation projection and correct newest-first selections.
- [ ] Complete session and Files filter semantics with count parity.
- [ ] Handle session removal and deterministic selection fallback.
- [ ] Add pure paused-update coalescing and replace array replay.
- [ ] Subscribe to system theme/reduced-motion changes and apply effective root state.
- [ ] Make max-events and auto-follow settings govern runtime behavior.
- [ ] Derive secure WebSocket protocol from page protocol.
- [ ] Abort and identity-guard file content/diff requests.
- [ ] Validate and migrate persisted settings.

## Testing

- [ ] Unit tests for recency, every filter dimension, and configured projection limits.
- [ ] Unit tests for coalescing snapshot/update/remove order.
- [ ] Tests for settings migration and media-query changes.
- [ ] Tests for session-removal fallback and explicit-selection preservation.
- [ ] Tests for out-of-order file responses, abort, retry, binary, deleted, and untracked states.

## Verification

- [ ] Run dashboard typecheck, build, and tests.
- [ ] Manually verify pause/resume under rapid events and settings persistence after reload.

## Documentation

- [ ] Update living spec settings, filters, pause, removal, and WebSocket behavior.

## Completion

- [ ] Reviewer confirms visible controls match runtime behavior.
- [ ] Complete and archive only after dependency specs are shipped.
