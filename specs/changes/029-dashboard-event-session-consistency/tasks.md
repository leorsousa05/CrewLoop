# Tasks: Dashboard Event and Session Consistency

## Setup

- [x] Create the full spec folder and dependency on spec 028.
- [ ] Capture sanitized representative payload fixtures for every supported source.

## Implementation

- [ ] Add canonical runtime parsing and payload-only path normalization.
- [ ] Add `invocation_id` to server/client contracts and presenter output.
- [ ] Preserve absolute workspace roots outside payload normalization.
- [ ] Define create/start/activity/end/idle/resume/prune transitions in `StateStore`.
- [ ] Derive session timestamps from events and prevent ended sessions becoming active.
- [ ] Emit typed session-removal messages and clean runtime root mappings.
- [ ] Forward native identity, status, duration, arguments, and output in each adapter where available.
- [ ] Update the OpenCode plugin contract in CLI hooks without exposing secrets.
- [ ] Make invocation pairing correlation-first with explicit legacy fallback.

## Testing

- [ ] Invalid type/enum/timestamp/ID/schema events cause no mutation or broadcast.
- [ ] Workspace roots survive while nested payload paths become relative.
- [ ] Concurrent same-tool calls ending out of order pair correctly.
- [ ] Explicit resume, idle end, active selection, prune, and mapping cleanup are deterministic.
- [ ] Contract fixtures cover success, failure, duration, path, identity, and missing optional fields per source.

## Verification

- [ ] Run CLI tests if `packages/cli/src/hooks.ts` changes.
- [ ] Run dashboard typecheck, build, and test suite.

## Documentation

- [ ] Update supported-source and normalization contracts in the living spec.
- [ ] Document correlation fallback limitations.

## Completion

- [ ] Reviewer verifies all five adapters against fixtures.
- [ ] Complete and archive only after spec 028 is shipped.
