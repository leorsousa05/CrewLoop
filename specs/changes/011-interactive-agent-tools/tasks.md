# Tasks: Interactive Agent Tools & Eco-pipeline Integration

## Phase 1: Conventions & Main Skills Refactoring (Already Completed Checklist)
- [x] Add `AGENT INTERACTIVE TOOLS & CAPABILITIES` to `references/conventions.md`
- [x] Update `Letter-Based Navigation` in `references/conventions.md` to mandate `ask_question` usage
- [x] Update all 13 existing skills under `skills/` to return to Orchestrator and use `ask_question` tool

## Phase 2: Inconsistencies & Root Documentation Refactoring
- [x] Fix linear workflow reference in `README.md` (Workflow diagram, rules, and step 4 contributing section)
- [x] Fix linear workflow reference in `AGENTS.md` (Workflow diagram, rules, AFK behavior, and contribution section)
- [x] Embed the "Bundle Lock-In" constraint in `AGENTS.md`
- [x] Correct residual direct routing in `skills/orchestrator/SKILL.md` (Line 77 next skill logic)
- [x] Correct residual direct routing in `skills/engineer/SKILL.md` (Line 32 code review routing)
- [x] Correct residual direct routing in `skills/maintainer/SKILL.md` (Line 50 route to engineer)

## Phase 3: Create 3 New Supporting Skills
- [x] Create `skills/frontend-architect/SKILL.md`
- [x] Create `skills/schema-designer/SKILL.md`
- [x] Create `skills/devops-specialist/SKILL.md`

## Phase 4: CLI Formatting & Enforcement Rules
- [x] Add the CLI Output Format schemas for all skills in `references/conventions.md`
- [x] Add the Bundle Lock-In self-consistency check instructions in `references/conventions.md`

## Phase 5: Validation
- [x] Run `python3 scripts/validate-skills.py` and verify all 16 skills pass tests
