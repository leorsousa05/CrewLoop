# Supporting Team Skills

## Overview

The core Loop Engineering Agents workflow covers discovery, specs, design, implementation, review, documentation, and shipping. Additional skills extend the team for real-world scenarios without overlapping core responsibilities:

- **tester** — QA strategy, coverage analysis, and bug reproduction.
- **product-manager** — Prioritization, success metrics, and value framing.
- **maintainer** — Bug triage, technical debt, and upkeep planning.
- **researcher** — Technology evaluation, comparisons, and proofs of concept.
- **security-guard** — Deep-dive security review, secrets scanning, dependency audit, and infrastructure exposure analysis.
- **accessibility-auditor** — WCAG compliance, keyboard navigation, semantic markup, and inclusive UI review.

## Routing

The CrewLoop Hub or reviewer may optionally route to supporting skills before sending work to the architect, engineer, or shipper:

- `product-manager` / `researcher` / `maintainer` → `architect`
- `tester` ↔ `engineer` (QA feedback loop)
- `security-guard` → `engineer` or `reviewer`
- `accessibility-auditor` → `engineer`, `designer`, or `reviewer`

All skills eventually return to the CrewLoop Hub.

## Files

- `skills/tester/SKILL.md`
- `skills/product-manager/SKILL.md`
- `skills/maintainer/SKILL.md`
- `skills/researcher/SKILL.md`
- `skills/security-guard/SKILL.md`
- `skills/accessibility-auditor/SKILL.md`
