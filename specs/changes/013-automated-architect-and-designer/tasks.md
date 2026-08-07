# Tasks: Automated Plan and Design Workflow

## Step 1: Hub Skill Refactoring
- [x] Edit `skills/crewloop-hub/SKILL.md` to:
  - Spec that discovery must resolve all tech stack and UI/UX design preferences.
  - Instruct the Hub to automatically invoke or delegate to `crewloop:plan` and `crewloop:design`, omitting manual confirmation stages for these two spec-gathering phases.

## Step 2: Plan Skill Refactoring
- [x] Edit `skills/crewloop-plan/SKILL.md` to:
  - Remove stop conditions that prompt the user for clarifications.
  - Instruct `crewloop:plan` to write specs immediately to `specs/changes/` based on the Hub's Task Brief, then return control immediately to the Hub.

## Step 3: Design Skill Refactoring
- [x] Edit `skills/crewloop-design/SKILL.md` to:
  - Remove "Step 1: Discovery (2-3 questions)" from design thinking.
  - Instruct `crewloop:design` to write visual specifications directly and return control.

## Step 4: Verification
- [x] Run validation script on all edited skills (`python3 scripts/validate-skills.py`).
