# Tasks: Clean and Focused Orchestrator Task Brief and Shipper Bumps

## Phase 1: Orchestrator Skill Update
- [x] Modify `skills/orchestrator/SKILL.md` to update Step 3 (Consolidate into Structured Brief) with the new dynamic and concise template layout.
- [x] Add explicit instructions to dynamically omit empty headers or fields from the final brief markdown.

## Phase 2: Shipper Skill Update
- [x] Modify `skills/shipper/SKILL.md` to update Step 4 (Verify & Bump Package Version) detection logic: inspect file paths in diff to trigger mandatory version bumps on `feat` or `fix`.
- [x] Add mandatory bump checks to the Shipper's Response Rules and self-checklist to fail-gate commits if a required bump is missing.

## Phase 3: Verification
- [x] Run `python3 scripts/validate-skills.py` to ensure all 18 skills are valid.

