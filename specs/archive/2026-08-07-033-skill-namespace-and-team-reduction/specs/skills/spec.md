# Spec Delta: Skills (Team Bundle)

## Current State

19 skills with flat names (`architect`, `engineer`, …) plus `crewloop-hub`. Transition contract covers 19 roles, including 11 supporting skills that were never validated in practice. Skills reference each other by flat names in menus, AFK targets, and descriptions.

## Changes

### ADDED
- `crewloop:*` namespace for all skills (frontmatter `name:`) — `crewloop:hub`, `crewloop:plan`, `crewloop:design`, `crewloop:code`, `crewloop:review`, `crewloop:ship`, `crewloop:brainstorm`, `crewloop:docs`.

### MODIFIED
- 8 SKILL.md files → new `name:` frontmatter, all internal skill references, menus, and AFK targets use new names (`skills/crewloop-*/SKILL.md`).
- `references/skill-contracts.yaml` → rewritten with 8 entries, `version: 2`.
- `references/conventions.md` → transition contract reduced to 8 rows; prefix table reduced; Hub entry menu loses `[T]` (long-term-manager); DiamondBlock lifecycle section removed; bug-fixing pipeline no longer mentions maintainer.
- `references/workflow.md` → 8-skill role table and simplified flow.
- `references/skill-anatomy.md`, `assets/templates/skill-template.md` → naming convention documents `crewloop:<slug>` / `crewloop-<slug>`.
- `AGENTS.md` → repository structure, "The 19 Skills" → "The 8 Skills", bundle lock-in rule, flow rules.
- `README.md` → skill list and install docs reflect 8 skills.

### REMOVED
- 11 skill directories: `long-term-manager`, `diamondblock`, `accessibility-auditor`, `frontend-architect`, `maintainer`, `product-manager`, `researcher`, `schema-designer`, `security-guard`, `devops-specialist`, `tester`.
- All references to removed skills across skills/, references/, AGENTS.md, README.md.
- DiamondBlock runtime lifecycle section in `references/conventions.md`.

## Migration Notes

Users with the 19-skill bundle installed should re-run `crewloop install` after upgrading; old skill directories may need manual cleanup (documented in README).

## Backward Compatibility

Breaking: old skill names and the 11 removed skills disappear. Accepted per project owner decision; source-only change, no runtime migration.
