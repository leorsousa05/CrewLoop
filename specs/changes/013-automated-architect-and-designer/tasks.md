# Tasks: Automated Architect and Designer Workflow

## Step 1: Orchestrator Skill Refactoring
- [x] Edit `skills/crewloop-hub/SKILL.md` to:
  - Spec that discovery must resolve all tech stack and UI/UX design preferences.
  - Instruct the Orchestrator to automatically invoke or delegate to the Architect and Designer, omitting manual confirmation stages for these two spec-gathering phases.

## Step 2: Architect Skill Refactoring
- [x] Edit `skills/architect/SKILL.md` to:
  - Remove stop conditions that prompt the user for clarifications.
  - Instruct the Architect to write specs immediately to `specs/changes/` based on the Orchestrator's Task Brief, then return control immediately to the Orchestrator.

## Step 3: Designer Skill Refactoring
- [x] Edit `skills/designer/SKILL.md` to:
  - Remove "Step 1: Discovery (2-3 questions)" from design thinking.
  - Instruct the Designer to write visual specifications directly and return control.

## Step 4: Verification
- [x] Run validation script on all edited skills (`python scripts/validate-skills.py`).
