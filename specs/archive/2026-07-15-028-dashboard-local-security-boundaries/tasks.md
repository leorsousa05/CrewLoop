# Tasks: Dashboard Local Security Boundaries

## Setup

- [x] Create the full spec folder and ADR 005 contract.
- [x] Record baseline `npm run typecheck`, `npm run build`, and `npm test` results.

## Implementation

- [x] Add bounded resource settings to `ServerConfig` and config loading.
- [x] Add and unit-test the local Host/Origin policy.
- [x] Add and unit-test canonical workspace containment, including symlinks.
- [x] Refactor workspace listing, file content, and diff handlers to use the policy.
- [x] Remove CWD/repository/session-substring authorization fallbacks and debug logs.
- [x] Bound `/event` body ingestion and return safe typed errors.
- [x] Keep required credential redaction while preserving non-secret local tool content.

## Testing

- [x] Integration tests for valid workspace listing, content, tracked diff, and untracked diff.
- [x] Reject sibling-prefix, `..`, absolute, forged-session, and symlink-escape paths.
- [x] Reject foreign WebSocket origins and accept configured local origins.
- [x] Reject oversized bodies/files/scans without partial state updates.
- [x] Verify client errors and logs do not disclose absolute paths or raw stderr.

## Verification

- [x] Run `npm run typecheck` in `servers/dashboard/`.
- [x] Run `npm run build` in `servers/dashboard/`.
- [x] Run `npm test` in `servers/dashboard/`.

## Documentation

- [ ] Update security and filesystem sections in `servers/dashboard/README.md` (deferred to spec 032 documentation consolidation).
- [x] Update `specs/living/dashboard/spec.md` with enforced local boundaries.

## Completion

- [ ] Reviewer security pass completed.
- [ ] Archive during shipping.
