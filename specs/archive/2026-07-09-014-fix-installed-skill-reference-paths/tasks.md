# Fix installed skill reference paths

## Context

When CrewLoop skills are installed via `crewloop install`, the `SKILL.md` files reference shared documents using relative paths such as `../../references/conventions.md`. In the source repository this resolves correctly (`skills/<skill>/SKILL.md` → `references/conventions.md`). However, once installed at `~/.agents/skills/<skill>/SKILL.md`, the same relative path resolves to `~/.agents/references/conventions.md`, which does not exist. The installer currently copies the shared `references/` and `assets/` directories **into** each individual skill directory, so the files exist at `~/.agents/skills/<skill>/references/conventions.md` but are never found by the `../../references/` links.

This causes every installed skill that reads `conventions.md` or `workflow.md` to fail when used outside the CrewLoop repository.

## Goal

Make the installer place shared `references/` and `assets/` at the location that installed `SKILL.md` files actually reference: the parent directory of the skills target folder (`<targetDir>/../references/` and `<targetDir>/../assets/`). This keeps all existing `SKILL.md` links working without editing any skill Markdown.

## Acceptance Criteria

- [x] After `crewloop install`, `<targetDir>/../references/conventions.md` exists.
- [x] After `crewloop install`, `<targetDir>/../references/workflow.md` exists.
- [x] After `crewloop install`, `<targetDir>/../assets/` exists with the shared templates.
- [x] Existing skill-specific references in `<targetDir>/<skill>/references/` are untouched.
- [x] `--dry-run` reports the shared-dir installation without writing files.
- [x] `--symlink` mode creates appropriate symlinks for shared dirs (or equivalent working resolution).
- [x] Existing installer tests are updated to assert the new shared-dir location.
- [x] New tests cover the parent-directory placement and symlink behavior.
- [x] `npm test` in `packages/cli/` passes.
- [x] `python scripts/validate-skills.py` passes.

## Implementation Steps

1. **Update `packages/cli/src/installer.ts`**
   - Change `mergeSharedDirs(targetSkillPath, sharedRoot, options)` so it targets the parent of the skills installation directory instead of an individual skill directory.
   - Compute `sharedTargetDir = path.resolve(targetDir, '..')` and copy/merge `references/` and `assets/` there.
   - Ensure the function still supports `dryRun` and overwrites existing files.
   - Call the updated function once from `installSkills` after the skill copy loop, rather than once per skill.
   - For `--symlink` installs, create symlinks at `<targetDir>/../references` and `<targetDir>/../assets` pointing to the source `references/` and `assets/` directories, so `../../references/` resolves correctly.

2. **Update `packages/cli/src/tests/installer.test.ts`**
   - Change `mergeSharedDirs` tests to assert files are placed under `path.resolve(targetDir, '..', 'references')` and `path.resolve(targetDir, '..', 'assets')`.
   - Update the `installSkills` integration test to assert shared files are at the parent of the skills target directory.
   - Update the symlink test to assert shared directories are linked at the parent of the skills target directory.

3. **Run verification**
   - `cd packages/cli && npm test`
   - `python scripts/validate-skills.py` from repo root

## Notes

- This is a backward-compatible fix: all installed skills already use `../../references/`, so creating the shared directory makes them work immediately. No skill Markdown files need to change.
- The fix respects custom `--target` directories because the shared dir is always computed as `path.resolve(targetDir, '..')`.
