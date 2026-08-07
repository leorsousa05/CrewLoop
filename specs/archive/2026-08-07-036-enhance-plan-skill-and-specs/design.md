# Design: Enhance CrewLoop Plan Skill & Spec Quality

## Architecture & Schema Enhancements

### 1. Spec Template Upgrades
- `design-template.md`: Add dedicated sections for `Contracts & Interfaces` (TypeScript/Python code blocks) and `Input/Output Edge Case Matrix` (table format).
- `tasks-template.md`: Update task format to include:
  - `- [ ] Task N: Description`
  - `  - Files: path/to/file`
  - `  - Depends on: Task X`
  - `  - Verification: command to run`
  - `  - Done when: criteria`
- `spec-yaml-template.yaml`: Add subagent parallelization flags and verification command definitions.

### 2. Skill Directive Enhancements (`skills/crewloop-plan/SKILL.md`)
- Incorporate pre-question codebase exploration via read-only subagents.
- Mandate structured `ask_question` usage for multi-choice alignment.
- Add a pre-handoff validation checklist to confirm all spec files meet the new standards.

## File Changes

- `skills/crewloop-plan/SKILL.md` — Updated workflow directives.
- `skills/crewloop-plan/references/templates/*` — Upgraded spec templates.
- `specs/templates/*` — Mirror updated working templates.
- `references/conventions.md` — Updated spec structure guidelines.
