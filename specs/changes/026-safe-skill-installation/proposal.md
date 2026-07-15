# Proposal: Safe Skill Installation Layout

## Status
- **State:** active
- **Created:** 2026-07-14
- **Author:** @opencode

## Problem Statement

`installSkills` currently creates a symlink for the complete skill directory and then removes and replaces `references/` and `assets/` through that symlink. Because the installed path resolves to the source skill, the removal can mutate the packaged source tree and delete skill-local references. Copy mode also merges shared and local files into the same namespaces, allowing name collisions and silent overwrites.

The installer must preserve both the immutable shared CrewLoop material and each skill's local material without relying on overlay filesystem behavior. This safety fix is required before progressive-disclosure work adds more local references or shared pointers.

## Goals

1. Guarantee that copy and symlink installations never mutate the source package.
2. Preserve skill-local `references/` and `assets/` independently from shared CrewLoop files.
3. Make source and installed shared links deterministic and collision-free.
4. Preserve dry-run, force, selective installation, and custom target behavior.
5. Cover the installation contract with regression tests that reproduce the current destructive case.

## Non-Goals

- Slimming or rewriting skill prompts.
- Resolving current routing, AFK, documentation, or skill-count inconsistencies.
- Adding token telemetry to the dashboard.
- Changing hook installation or dashboard event behavior.
- Supporting shared-root links from nested skill-local Markdown files; this change defines shared links as a `SKILL.md` contract and tests that boundary.

## Constraints

- Keep `installer.ts` focused on skill file distribution; do not modify `hooks.ts`.
- Continue supporting Node.js 18 and the existing synchronous filesystem implementation.
- Avoid writing outside the requested target directory.
- Existing installations migrate through a normal `crewloop install --force`; no compatibility layer is required inside old installed folders.
- Source repository links remain `../../references/...` and `../../assets/...`; installed `SKILL.md` links use the reserved `_crewloop/` namespace.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users expect the installed skill root itself to be a symlink | Medium | Document that `--symlink` links skill payloads while materializing the wrapper and rewritten `SKILL.md` |
| Force removal follows a source symlink from an older installation | High | Remove the target entry itself before creating the new wrapper; never remove children until the wrapper is known to be a real directory |
| New namespace is unsupported by an agent loader | Low | `_crewloop/` is ordinary content beneath the installed skill and references are opened by relative path |
| A local entry is named `_crewloop` | Medium | Treat `_crewloop` as reserved and report an installation error rather than overwrite it |
| Shared links appear in nested local Markdown later | Medium | Add an explicit test/contract and defer recursive materialization to a future spec if needed |

## Success Criteria

- [ ] Running a symlink installation leaves a byte-level snapshot of the source skill unchanged.
- [ ] Local and shared files with the same basename both remain available under distinct paths.
- [ ] Copy and symlink modes resolve installed shared links under `_crewloop/references/` and `_crewloop/assets/`.
- [ ] Local references remain available at `references/` in both modes.
- [ ] `--force` safely replaces a legacy whole-directory symlink without touching its source.
- [ ] CLI build and tests pass from `packages/cli/`.

## Deferred

- Prompt progressive disclosure and context benchmarking are deferred until this blocker passes review.
- Semantic skill validation and routing reconciliation will be handled in a separate change to avoid coupling installer safety with documentation contracts.
