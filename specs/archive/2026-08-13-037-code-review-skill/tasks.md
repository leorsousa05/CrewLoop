# Tasks: 037-code-review-skill

- [x] **T1** Create `skills/crewloop-code-review/SKILL.md` from `assets/templates/skill-template.md`
  - Files: `skills/crewloop-code-review/SKILL.md`
  - Depends on: —
  - Verification: `python scripts/validate-skills.py`
  - Done when: AC-1, AC-2, AC-5, AC-8 — file exists with correct frontmatter, validator passes, MODE section contains the NEVER restrictions, workflow defines the Code Debt Report.

- [x] **T2** Create `skills/crewloop-code-review/references/code-review-checklist.md`
  - Files: `skills/crewloop-code-review/references/code-review-checklist.md`
  - Depends on: T1
  - Verification: `test -s skills/crewloop-code-review/references/code-review-checklist.md`
  - Done when: AC-8 — checklist covers the 8 audit dimensions and the severity rubric defined in design.md.

- [x] **T3** Narrow `crewloop:review` scope in its SKILL.md
  - Files: `skills/crewloop-review/SKILL.md`
  - Depends on: —
  - Verification: `python scripts/validate-skills.py`
  - Done when: AC-4 — description states diff/change-gate scope and points whole-codebase audits to `crewloop:code-review`; transition contract unchanged (diff PASS → ship).

- [x] **T4** Register the skill in `references/skill-contracts.yaml`
  - Files: `references/skill-contracts.yaml`
  - Depends on: T1
  - Verification: `python -c "import yaml; d=yaml.safe_load(open('references/skill-contracts.yaml')); s=d['skills']['crewloop:code-review']; assert s['kind']=='supporting' and s['return_strategy']=='invoker'"`
  - Done when: AC-3 — entry exists with the exact fields from design.md.

- [x] **T5** Update `references/workflow.md` and `references/conventions.md`
  - Files: `references/workflow.md`, `references/conventions.md`
  - Depends on: T1
  - Verification: `grep -c "code-review" references/workflow.md references/conventions.md` (≥1 match each)
  - Done when: AC-6 — both files list the skill as supporting with invoker return; AFK prefix table updated.

- [x] **T6** Update `AGENTS.md` and `README.md`
  - Files: `AGENTS.md`, `README.md`
  - Depends on: T1, T4
  - Verification: `grep -c "code-review" AGENTS.md README.md` (≥1 match each)
  - Done when: AC-7 — skill appears in the supporting-skills tables, Repository Structure tree includes `crewloop-code-review/`, and Bundle Lock-In no longer hard-codes "6 skills".

- [x] **T7** Final validation sweep
  - Files: all of the above
  - Depends on: T1–T6
  - Verification: `python scripts/validate-skills.py && git diff --stat`
  - Done when: AC-2 re-verified; only files listed in `.spec.yaml` are modified (non-goals respected).
