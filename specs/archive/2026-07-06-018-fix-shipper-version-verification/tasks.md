# Tasks: Fix Shipper Skill Version Verification

## Step 1: Update Shipper Skill
- [x] Edit `skills/shipper/SKILL.md` to:
  - Clarify in Step 4 that the root-level directories (such as `skills/`, `references/`, `assets/`) and root-level files are part of the versioned root package (e.g. `@archznn/crewloop-skills`).
  - Mandate that if any files in these root-level directories/files are modified under `feat` or `fix` commits, the root package version must be bumped.
  - Re-emphasize that `feat` commits require a **minor** version bump, while `fix` commits require a **patch** version bump.
  - Warn against using patch bumps (`0.0.1`) for features (`feat`), as features always require a minor (`0.1.0`) or major (`1.0.0`) bump under SemVer.

## Step 2: Validation
- [x] Run the python skill validation script: `python3 scripts/validate-skills.py`.
