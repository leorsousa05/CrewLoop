# Tasks: Enhance CrewLoop Plan Skill & Spec Quality

- [x] **Task 1: Upgrade Spec Templates**
  - Files: `skills/crewloop-plan/references/templates/design-template.md`, `skills/crewloop-plan/references/templates/tasks-template.md`, `skills/crewloop-plan/references/templates/spec-yaml-template.yaml`
  - Depends on: None
  - Verification: `python3 scripts/validate-skills.py`
  - Done when: Templates include contracts, edge cases, atomic task structure, and verification fields.

- [x] **Task 2: Sync Working Copy Templates & Conventions**
  - Files: `specs/templates/design-template.md`, `specs/templates/tasks-template.md`, `specs/templates/spec-yaml-template.yaml`, `references/conventions.md`
  - Depends on: Task 1
  - Verification: `git diff specs/templates/`
  - Done when: Working copy templates match plan reference templates and conventions document updated rules.

- [x] **Task 3: Update Plan Skill Directives**
  - Files: `skills/crewloop-plan/SKILL.md`
  - Depends on: Task 1
  - Verification: `python3 scripts/validate-skills.py`
  - Done when: `SKILL.md` incorporates exploration probes, interactive questioning rules, and spec validation checklist.

- [x] **Task 4: Final Skill Validation**
  - Files: `skills/`
  - Depends on: Task 1, Task 2, Task 3
  - Verification: `python3 scripts/validate-skills.py`
  - Done when: All skills pass validation cleanly.
