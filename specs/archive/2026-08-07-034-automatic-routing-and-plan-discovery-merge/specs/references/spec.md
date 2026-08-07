# Spec Delta: References & Workflow Contract

## Current State

`references/skill-contracts.yaml` v2 defines 8 skills with letter-based menus for interactive skills. `references/workflow.md` describes a Hub-mediated flow with manual user routing. `references/conventions.md` includes the transition contract table with Hub, Plan, Brainstorm, and menu-block format examples.

## Changes

### MODIFIED
- `references/skill-contracts.yaml` → v3 with 6 skills, direct/conditional routes, no menu entries, `afk_target: crewloop:plan` for all skills.
- `references/conventions.md` → transition contract table reduced to 6 rows; menu-block example removed; AFK section rewritten as Plan-driven; Hub/Brainstorm references removed.
- `references/workflow.md` → team roles table reduced to 6 skills; flow diagram with `crewloop:plan` at entry; routing rules updated; AFK flow Plan-driven.
- `references/skill-anatomy.md` → notes that new skills use `crewloop:plan` as default invoker; directory naming unchanged.
- `assets/templates/skill-template.md` → default invoker `crewloop:plan`; transition contract example without menu; auto-route note.
- `AGENTS.md` and `README.md` → project overview, team tables, and flow rules reflect the 6-skill auto-routing model.

### REMOVED
- All references to `crewloop:hub`, `crewloop:brainstorm`, and letter-based navigation menus from the shared references and templates.

## Migration Notes

Authors creating new skills must register them in `references/skill-contracts.yaml` with a direct target and `afk_target: crewloop:plan`. The transition contract section in each `SKILL.md` must match the YAML entry exactly.

## Backward Compatibility

Breaking: the contract vocabulary changes from menus to direct routes. The validator enforces the new contract, so any old skill content must be updated before it passes.
