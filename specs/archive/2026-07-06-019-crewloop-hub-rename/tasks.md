# Tasks: Rename Orchestrator to CrewLoop Hub

## Setup
- [ ] Confirm the canonical name change from `orchestrator` to `crewloop-hub`
- [ ] Identify all source, docs, and generated-artifact references that still use the old canonical name

## Implementation
- [ ] Rename `skills/orchestrator/SKILL.md` to `skills/crewloop-hub/SKILL.md`
- [ ] Update skill metadata, headings, menus, and dashboard session naming to `crewloop-hub`
- [ ] Update CLI hook defaults and repo-root detection to use the new skill name
- [ ] Update dashboard skill registry, constants, and tests to recognize the new canonical name
- [ ] Update docs pages, landing page copy, sidebar entries, README, AGENTS, and workflow references
- [ ] Update any committed generated outputs that mirror the source references

## Testing
- [ ] Re-run `python3 scripts/validate-skills.py`
- [ ] Run targeted repository searches to confirm canonical `orchestrator` references are gone where the rename applies
- [ ] Run relevant package tests if needed to verify CLI/dashboard expectations

## Verification
- [ ] Confirm the public docs and skill bundle consistently say `CrewLoop Hub`
- [ ] Confirm the workflow still routes to Architect first
- [ ] Confirm no stale default-skill or dashboard label points at the old canonical name

## Completion
- [ ] Leave the change ready for review
