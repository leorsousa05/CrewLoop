# Spec: Align navigation-menu rules and local reference instructions

## Acceptance criteria

1. `AGENTS.md` explicitly allows skills to present a context-aware subset of the full letter-based navigation menu.
2. `AGENTS.md` documents AFK mode as an explicit exception where the menu may be skipped and the next skill loaded automatically.
3. Every `SKILL.md` that instructs reading local references uses conditional language (e.g., "if present", "when they exist").
4. `scripts/validate-skills.py` still passes after the changes.

## Affected files

- `AGENTS.md`
- `skills/orchestrator/SKILL.md`
- `skills/architect/SKILL.md`
- `skills/designer/SKILL.md`
- `skills/engineer/SKILL.md`
- `skills/reviewer/SKILL.md`
- `skills/shipper/SKILL.md`
- `skills/docs-writer/SKILL.md`
- `skills/tester/SKILL.md`
- `skills/researcher/SKILL.md`
- `skills/product-manager/SKILL.md`
- `skills/maintainer/SKILL.md`
- `skills/obsidian-second-brain/SKILL.md`

## Non-goals

- Rewriting individual navigation options.
- Creating missing `references/` or `assets/` directories.
- Changing AFK-mode activation conditions.
