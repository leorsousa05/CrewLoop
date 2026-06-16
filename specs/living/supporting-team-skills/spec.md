# Supporting Team Skills

## Overview

The core Loop Engineering Agents workflow covers discovery, specs, design, implementation, review, documentation, and shipping. Four additional skills extend the team for real-world scenarios without overlapping core responsibilities:

- **tester** — QA strategy, coverage analysis, and bug reproduction.
- **product-manager** — Prioritization, success metrics, and value framing.
- **maintainer** — Bug triage, technical debt, and upkeep planning.
- **researcher** — Technology evaluation, comparisons, and proofs of concept.

## Routing

The orchestrator may optionally route to these skills before sending work to the architect or engineer:

- `product-manager` / `researcher` / `maintainer` → `architect`
- `tester` ↔ `engineer` (QA feedback loop)

All skills eventually return to the orchestrator.

## Files

- `skills/tester/SKILL.md`
- `skills/product-manager/SKILL.md`
- `skills/maintainer/SKILL.md`
- `skills/researcher/SKILL.md`
