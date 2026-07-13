# Tasks: Designer Skill Hardening and Vite Bootstrap Helper

## Spec and Reference Updates
- [x] Refactor `skills/designer/SKILL.md` to require a single committed aesthetic thesis and explicit anti-pattern rejection.
- [x] Expand `skills/designer/references/` into multiple topical files for anti-patterns, layout, typography, color, motion, case-study framing, and output checks.
- [x] Update the Designer references index so the main skill can navigate the new corpus cleanly.
- [x] Update `docs/public/docs/core/designer.md` to describe the stronger direction contract.
- [x] Update `docs/public/docs/contributing/writing-a-skill.md` if needed to mention the richer reference pattern.

## Script Helper
- [x] Add `scripts/bootstrap-vite.sh` with an explicit, safe scaffold flow.
- [x] Define the helper's CLI arguments, exit codes, and failure behavior.
- [x] Document when to use the helper versus when to skip it.

## Verification
- [x] Run `python scripts/validate-skills.py`.
- [x] Manually inspect the generated spec and reference map for completeness.
- [x] Verify the script helper contract covers success, invalid arguments, and no-surprise behavior.
