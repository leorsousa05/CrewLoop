---
adr: 007
title: ADR 007: Skill Namespace `crewloop:*` and 8-Skill Team
status: accepted
date: 2026-08-05
---

# ADR 007: Skill Namespace `crewloop:*` and 8-Skill Team

- **Status:** accepted
- **Date:** 2026-08-05
- **Related spec:** `specs/archive/2026-08-07-033-skill-namespace-and-team-reduction/`

## Context

The bundle shipped 19 skills with flat, generic names (`architect`, `engineer`, `tester`, …) that collide with other skills in host agents and give no bundle identity. Eleven of the 19 supporting skills were never validated in practice — neither by AI runs nor by human testing — so shipping them means shipping an untested workflow surface.

## Decision

We will namespace all skills under `crewloop:*` (frontmatter `name:`, e.g. `crewloop:plan`, `crewloop:code`) with filesystem-safe directories (`crewloop-plan`, `crewloop-code`), and we will reduce the shipped team to the 8 validated skills: `crewloop:hub`, `crewloop:plan`, `crewloop:design`, `crewloop:code`, `crewloop:review`, `crewloop:ship`, `crewloop:brainstorm`, `crewloop:docs`. The 11 unvalidated supporting skills (long-term-manager, diamondblock, accessibility-auditor, frontend-architect, maintainer, product-manager, researcher, schema-designer, security-guard, devops-specialist, tester) are removed along with every cross-reference, including the CLI `--diamondblock` surface.

## Alternatives Considered

| Alternative | Why rejected |
|-------------|--------------|
| Keep 19 skills, only rename | Ships untested workflow surface; owner explicitly wants a 100% tested flow |
| Directory name = `crewloop:plan` (literal colon) | `:` is unsafe on Windows filesystems and in some packaging/URL contexts |
| Keep flat names, prefix only in docs | Solves nothing — collisions happen at the agent's skill registry, keyed by `name:` |
| Deprecate removed skills gradually | No user base depends on them; removal is cleaner than dead deprecation paths |

## Consequences

- **Positive:** Collision-free bundle identity; every shipped skill is validated; smaller validation matrix (`validate-skills.py` covers 8); simpler transition contract.
- **Negative:** Breaking change for existing installs (old names disappear; re-install + manual cleanup required); losing specialist skills means future needs (security audit, a11y) must re-enter as new specs.
- **Irreversibility:** Renaming public skill identifiers breaks any external reference (installed hooks, user muscle memory, docs links). Reverting requires another repo-wide rename.

## References

- `specs/archive/2026-08-07-033-skill-namespace-and-team-reduction/`
- `references/skill-contracts.yaml` (v2)
