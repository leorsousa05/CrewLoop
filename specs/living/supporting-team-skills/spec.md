# Supporting Team Skills

## Overview

The CrewLoop workflow is a 6-skill team:

- **Core crew** — `crewloop:plan`, `crewloop:design`, `crewloop:code`, `crewloop:review`, `crewloop:ship`.
- **Supporting crew** — `crewloop:docs`.

Supporting skills extend documentation without overlapping core responsibilities:

- **crewloop:docs** — Project, module, feature, and capability documentation. Returns to the actual invoking skill (default `crewloop:plan`).

## Routing

Skills route automatically per the transition contract. The user can interrupt the flow with `stop`, `pause`, `volta`, `voltar`, or `re-analyze`; otherwise each skill hands off directly to the next skill from its position in the workflow.

- `crewloop:docs` → invoker (default `crewloop:plan`)

In AFK mode, every skill returns to `crewloop:plan`, which evaluates workflow state and loads the next phase.

`references/skill-contracts.yaml` is the machine-readable authoring contract for all 6 skills. Each runtime `SKILL.md` keeps a compact inline transition capsule so role identity, invoker behavior, direct routes, and AFK routing survive independent installation and context compaction.

## Files

- `skills/crewloop-docs/SKILL.md`
