# Proposal: Rename Orchestrator to CrewLoop Hub

## Status
- **State:** active
- **Created:** 2026-07-06
- **Author:** codex

## Problem Statement
The central CrewLoop role is still named `orchestrator` in several places even though the rest of the project now describes it as the main hub for the workflow. The mismatch shows up in skill metadata, docs navigation, dashboard labels, and CLI defaults.

That leaves the repository with two competing names for the same role and makes the product feel less cohesive.

## Goals
1. Rename the central skill and its public references to `crewloop-hub`.
2. Preserve the existing hub-and-spoke workflow semantics.
3. Update docs, CLI defaults, and dashboard labels so they all point at the same canonical name.
4. Keep the user-facing guidance consistent with the new brand language.

## Non-Goals
- Introducing a second core skill alongside the hub.
- Changing the workflow order or the responsibilities of any role.
- Adding runtime behavior beyond the rename and associated reference updates.

## Constraints
- Keep the change documentation-first.
- Update both source files and committed generated outputs where the repository already tracks them.
- Avoid leaving mixed naming in user-facing docs.

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Missed references leave broken links or stale defaults | High | Search the repository for `orchestrator` and update all canonical references |
| Renaming the central skill could desynchronize dashboard and CLI terminology | Medium | Update source, tests, and public docs together |
| The new name could confuse users looking for the old skill | Medium | Use consistent wording in docs and UI so the rename is explained by context |

## Success Criteria
- [ ] The central skill is named `crewloop-hub` in skill metadata and directory layout.
- [ ] CLI default-skill hooks and package root detection use the new canonical skill name.
- [ ] Dashboard labels and docs navigation show CrewLoop Hub instead of Orchestrator.
- [ ] Public docs and workflow references no longer depend on the old name as the primary label.
