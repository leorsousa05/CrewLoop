# Fix installed skill shared reference resolution

## Context

When CrewLoop skills are installed via `crewloop install`, the `SKILL.md` files reference shared documents using relative paths such as `../../references/conventions.md`. A previous fix placed the shared `references/` and `assets/` directories at the parent of the skills target folder (`<targetDir>/../references/`), which matches the literal `../../references/` resolution from an installed skill file.

However, in practice the agent still attempted to read the shared references from inside the skill directory (`<targetDir>/<skill>/references/conventions.md`) and failed. The installed skill files need to work with the path that the agent actually resolves.

## Goal

Make installed skills self-contained by copying shared `references/` and `assets/` into each individual skill directory and rewriting the relative Markdown links from `../../references/` to `references/` during installation. This guarantees the agent finds the files at the path it actually uses.

## Acceptance Criteria

- [x] After `crewloop install`, `<targetDir>/<skill>/references/conventions.md` exists.
- [x] After `crewloop install`, `<targetDir>/<skill>/references/workflow.md` exists.
- [x] After `crewloop install`, `<targetDir>/<skill>/assets/` exists with the shared templates.
- [x] Installed `SKILL.md` links to `references/conventions.md` instead of `../../references/conventions.md`.
- [x] Skill-specific references in `<targetDir>/<skill>/references/` are merged with (not replaced by) shared references.
- [x] `--dry-run` reports installation without writing files.
- [x] `--symlink` mode creates symlinks for shared dirs inside the skill directory.
- [x] Existing installer tests are updated to assert the new behavior.
- [x] `npm test` in `packages/cli/` passes.
- [x] `python3 scripts/validate-skills.py` passes.

## Implementation Steps

1. **Update `packages/cli/src/installer.ts`**
   - Copy shared `references/` and `assets/` into each installed skill directory.
   - Rewrite `../../references/` → `references/` and `../../assets/` → `assets/` in the installed `SKILL.md`.
   - For `--symlink` installs, create symlinks for shared dirs inside the skill directory.

2. **Update `packages/cli/src/tests/installer.test.ts`**
   - Replace `mergeSharedDirs` tests with tests asserting shared files are inside each skill.
   - Assert that relative links are rewritten in copy mode.
   - Assert that links are preserved in symlink mode.

3. **Run verification**
   - `cd packages/cli && npm run build && npm test`
   - `python3 scripts/validate-skills.py` from repo root
