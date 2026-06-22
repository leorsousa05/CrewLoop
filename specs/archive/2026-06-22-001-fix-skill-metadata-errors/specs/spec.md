# Spec: Fix skill metadata errors

## Acceptance criteria

1. No `SKILL.md` file contains the string `file:///home/arch/` or `/home/arch/`.
2. All replaced links continue to point to the correct files:
   - `references/conventions.md` → `../../references/conventions.md`
   - `references/workflow.md` → `../../references/workflow.md`
3. `skills/orchestrator/SKILL.md` has no duplicated `2.7` section; the former second `2.7` becomes `2.11`.
4. `scripts/validate-skills.py` still passes after the changes.

## Affected files

- `skills/orchestrator/SKILL.md`
- `skills/architect/SKILL.md`
- `skills/designer/SKILL.md`
- `skills/engineer/SKILL.md`
- `skills/reviewer/SKILL.md`
- `skills/shipper/SKILL.md`
- `skills/docs-writer/SKILL.md`

## Non-goals

- Changing navigation-menu content or AFK-mode behavior.
- Creating missing local reference directories.
- Modifying `AGENTS.md` or `README.md` beyond updating links if referenced.
