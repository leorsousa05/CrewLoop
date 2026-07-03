# Tasks: Standardized Navigation, Bug-Fixing Flow, and Skill Modularization

## Phase 1: Conventions & Root Documentation Updates
- [x] Add the mandatory next-step recommendation requirement to `references/conventions.md`
- [x] Add the lightweight bug spec definition to `references/conventions.md`
- [x] Update `references/workflow.md` to define the strict bug-fixing pipeline (Maintainer -> Architect -> Engineer -> Reviewer -> Shipper)
- [x] Update `AGENTS.md` and `README.md` to document the modular skill layout and the bug-fixing workflow

## Phase 2: Bug-Fixing Pipeline & Supporting Skills Updates
- [x] Update `skills/maintainer/SKILL.md` to mandate the bug-fixing flow and triage instructions
- [x] Update `skills/architect/SKILL.md` to document lightweight spec creation for bugs

## Phase 3: Core Skills Modularization & Navigation Refactoring
- [x] Refactor `skills/orchestrator/SKILL.md` (Update navigation and next-step prompt instructions)
- [x] Refactor `skills/architect/SKILL.md` (Modularize dense conceptual checklists/ADR rules, update navigation)
- [x] Refactor `skills/designer/SKILL.md` (Modularize visual reference style rules, update navigation)
- [x] Refactor `skills/engineer/SKILL.md` (Modularize coding guidelines and TDD skip rules, update navigation)
- [x] Refactor `skills/reviewer/SKILL.md` (Modularize security & code-quality checklists, update navigation)
- [x] Refactor `skills/shipper/SKILL.md` (Modularize commit/branch and tag/release templates, update navigation)

## Phase 4: Supporting Skills Navigation Refactoring
- [x] Refactor `skills/accessibility-auditor/SKILL.md`
- [x] Refactor `skills/docs-writer/SKILL.md`
- [x] Refactor `skills/product-manager/SKILL.md`
- [x] Refactor `skills/researcher/SKILL.md`
- [x] Refactor `skills/security-guard/SKILL.md`
- [x] Refactor `skills/tester/SKILL.md`
- [x] Refactor `skills/frontend-architect/SKILL.md`
- [x] Refactor `skills/schema-designer/SKILL.md`
- [x] Refactor `skills/devops-specialist/SKILL.md`
- [x] Refactor `skills/project-brainstorm/SKILL.md`
- [x] Refactor `skills/long-term-manager/SKILL.md`

## Phase 5: Verification & Validation
- [x] Run `python scripts/validate-skills.py` to ensure all 18 skills are valid
- [x] Manually verify all relative links from `SKILL.md` to their local `references/` folders
