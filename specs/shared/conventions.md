# Conventions (shared)

> Project-wide conventions for specs, commits, and code. The canonical full rules live in `references/conventions.md` at the repository root — this file is the shared pointer for specs and RFCs.

## Spec conventions

- Feature specs: single file per task in `specs/features/<domain>/spec-NN-name.md`, following `specs/templates/feature-spec.md`. One spec = one task.
- RFCs: `specs/changes/rfc-NNN-name.md` for architecture changes; no implementation while in `changes/`.
- ADRs: `specs/shared/adrs/adr-NNN-name.md` for accepted irreversible decisions.
- Completed feature specs stay in `features/` (source of truth). Dead/rejected proposals go to `specs/archive/` with a reason in `specs/archive/README.md`.
- Specs reference `shared/` content by link, never by copying.
- `specs/memory/project-state.md` is read on every session and updated at session end.

## Commit conventions

- Conventional Commits: `<type>(<scope>): <description>` — imperative mood, max 72 chars, no trailing period.
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Branches: `<type>/<short-description>` in kebab-case.

## Code conventions

- Prefer self-documenting names; split files >300 lines; make side effects visible; clarity over cleverness; be explicit.
- TDD: write tests when there is branching, side effects, external dependencies, or public API surface.

## Security

- Never store secrets in repository files.
- Review scans for `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`, `.env` files, build dirs, and AI artifacts.
- Dashboard binds to `127.0.0.1` and strips dangerous keys before storage/broadcast.
