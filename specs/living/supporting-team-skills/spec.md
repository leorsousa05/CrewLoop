# Supporting Team Skills

## Overview

The core Loop Engineering Agents workflow covers discovery, specs, design, implementation, review, documentation, and shipping. Additional skills extend the team for real-world scenarios without overlapping core responsibilities:

- **tester** — QA strategy, coverage analysis, and bug reproduction.
- **product-manager** — Prioritization, success metrics, and value framing.
- **maintainer** — Bug triage, technical debt, and upkeep planning.
- **researcher** — Technology evaluation, comparisons, and proofs of concept.
- **security-guard** — Deep-dive security review, secrets scanning, dependency audit, and infrastructure exposure analysis.
- **accessibility-auditor** — WCAG compliance, keyboard navigation, semantic markup, and inclusive UI review.
- **project-brainstorm** — Interactive discovery for ambiguous project ideas.
- **long-term-manager** — Durable multi-session project tracking.
- **diamondblock** — Optional memory and semantic context retrieval.
- **docs-writer** — Project, module, feature, and capability documentation.
- **frontend-architect** — Frontend component boundaries and state ownership.
- **schema-designer** — Relational schemas, migrations, and API contracts.
- **devops-specialist** — CI/CD, deployment, and infrastructure configuration.

## Routing

Core skills invoke their owned supporting specialists when needed. Under direct routing, supporting skills return to the actual invoker, except Maintainer and Project Brainstorm, which route confirmed triage/completed briefs to Architect:

- `product-manager` / `researcher` → `crewloop-hub` (discovery support)
- `maintainer` → `architect` (lightweight bug spec)
- `tester` → `engineer` (QA feedback loop)
- `security-guard` / `accessibility-auditor` → `reviewer`
- `schema-designer` → `architect`; `frontend-architect` → `designer`; `devops-specialist` → `shipper`

The CrewLoop Hub mediates mid-flow only in AFK mode. Every non-Hub skill returns to CrewLoop Hub in AFK; only the Hub selects the next phase.

`references/skill-contracts.yaml` is the machine-readable authoring contract for all 19 skills. Each runtime `SKILL.md` keeps a compact inline transition capsule so role identity, invoker behavior, menus, and AFK routing survive independent installation and context compaction.

## Files

- `skills/tester/SKILL.md`
- `skills/product-manager/SKILL.md`
- `skills/maintainer/SKILL.md`
- `skills/researcher/SKILL.md`
- `skills/security-guard/SKILL.md`
- `skills/accessibility-auditor/SKILL.md`
- `skills/project-brainstorm/SKILL.md`
- `skills/long-term-manager/SKILL.md`
- `skills/diamondblock/SKILL.md`
- `skills/docs-writer/SKILL.md`
- `skills/frontend-architect/SKILL.md`
- `skills/schema-designer/SKILL.md`
- `skills/devops-specialist/SKILL.md`
