# Tasks: Safe Skill Installation Layout

## Regression Coverage

- [x] Add a copy-mode fixture with skill-local references/assets and colliding shared basenames.
- [x] Add a symlink-mode fixture with skill-local references/assets.
- [x] Assert the source tree remains byte-for-byte unchanged after linked installation.
- [x] Add coverage for replacing a legacy whole-directory symlink with `--force`.
- [x] Add coverage for a reserved `_crewloop` source collision.

## Implementation

- [x] Convert shared-link rewriting into a pure content transformation.
- [x] Install shared references/assets beneath `<skill>/_crewloop/` in copy mode.
- [x] Replace whole-root symlink installation with a real wrapper and per-entry payload symlinks.
- [x] Materialize rewritten `SKILL.md` in linked mode.
- [x] Ensure target replacement removes only the target entry and never traverses its source.
- [x] Preserve dry-run, skip, force, custom target, and selective skill behavior.

## Documentation

- [x] Update CLI help for the materialized-wrapper meaning of `--symlink`.
- [x] Update `packages/cli/README.md` with copy and linked installed layouts.
- [x] Keep prompt optimization and semantic skill validation explicitly deferred.

## Verification

- [x] Run `npm run typecheck` in `packages/cli/`.
- [x] Run `npm run build` in `packages/cli/`.
- [x] Run `npm test` in `packages/cli/`.
- [x] Confirm no hook files were changed by this change (unrelated pre-existing hook changes remain in the worktree).
- [x] Confirm the implementation matches ADR 004.

## Completion

- [x] Submit implementation to Reviewer.
- [ ] Mark `.spec.yaml` completed only after review passes.
- [ ] Archive the change only during the shipping phase.
