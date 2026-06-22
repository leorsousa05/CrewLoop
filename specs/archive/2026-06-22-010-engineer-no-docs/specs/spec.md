# Spec: Reinforce that engineer skill does not write documentation

## Acceptance criteria

1. `skills/engineer/SKILL.md` includes a critical rule such as:
   > **NEVER write documentation** — READMEs, module docs, feature docs, API docs, and changelogs belong to the `docs-writer` skill. Focus on code and tests.
2. The `ANTI-PATTERNS` section includes an item such as:
   - ❌ Writing or updating READMEs, module docs, or feature documentation.
3. The change does not alter any other behavior of the engineer skill.
4. `python scripts/validate-skills.py` passes.

## Affected files

- `skills/engineer/SKILL.md`

## Non-goals

- Modifying any other skill files.
- Changing workflow rules in `AGENTS.md` or `references/workflow.md`.
