# Proposal: Document Recent CLI and Dashboard Fixes

## WHY

The Loop Engineering Agents project follows **Spec-Driven Development (SDD)**. Every change, including bug fixes, must be tracked in `specs/changes/` so that the team can understand what changed, why it changed, and how it was verified. The two most recent commits on branch `fix/dashboard-errors` were implemented without active specs:

- `3829ba4` — `fix(cli): include dashboard dependency and improve dashboard startup errors`
- `5ee7ec3` — `fix(dashboard): handle listen errors with friendly messages`

This spec retrospectively documents those changes to restore traceability and close the SDD gap before continuing with new work.

## Scope

- Retrospectively specify the CLI fix that added the `ws` dependency to the root package and added dependency checking before starting the dashboard.
- Retrospectively specify the dashboard fix that added friendly error messages for `EADDRINUSE` and `EACCES` listen errors.
- Update the root `package.json` and `packages/cli/package.json` version bumps are part of the documented state.
- No new runtime behavior is introduced by this spec; it records what is already in `main`.

## Constraints

- Must not change implementation code.
- Must follow the existing spec structure (`proposal.md`, `specs/spec.md`, `design.md`, `tasks.md`).
- Must reference the exact commits and affected files.
