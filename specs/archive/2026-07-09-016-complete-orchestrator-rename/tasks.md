# Complete orchestrator to crewloop-hub rename cleanup

## Context

The central CrewLoop skill was renamed from `orchestrator` to `crewloop-hub` (see archived spec `2026-07-06-019-crewloop-hub-rename`), and the directory `skills/orchestrator/` was already removed. However, many residual references to `orchestrator` remained across the skill files, CLI defaults, and living specs. This caused agents to route back to the old `/orchestrator` command instead of `/crewloop-hub`, and caused dashboard hooks to report `orchestrator` as the default skill.

## Goal

Remove all functional references to the old `orchestrator` canonical name and point them to `crewloop-hub` so the routing model is consistent.

## Acceptance Criteria

- [x] No `skills/*/SKILL.md` file contains the word `orchestrator`.
- [x] Every skill recommends `/crewloop-hub` (or the equivalent textual reference) as the next command.
- [x] CLI hook metadata uses `--default-skill crewloop-hub` instead of `--default-skill orchestrator`.
- [x] `packages/cli/AGENTS.md` uses `crewloop-hub` in hook examples.
- [x] Living specs (`specs/living/`) use `crewloop-hub` for hook commands and workflow references.
- [x] Active change specs (`specs/changes/011-*`, `specs/changes/013-*`) reference `skills/crewloop-hub/SKILL.md` instead of `skills/orchestrator/SKILL.md`.
- [x] `python3 scripts/validate-skills.py` passes.
- [x] `cd packages/cli && npm run build && npm test` passes.

## Implementation Steps

1. **Update all SKILL.md files**
   - Replace `/orchestrator` with `/crewloop-hub`.
   - Replace textual references like "orchestrator brief", "ask the orchestrator", "return to orchestrator" with "CrewLoop Hub" equivalents.

2. **Update CLI default skill**
   - Change `--default-skill orchestrator` to `--default-skill crewloop-hub` in `packages/cli/src/agents.ts`.
   - Update hook examples in `packages/cli/AGENTS.md`.

3. **Update living specs and active change specs**
   - Update hook command examples in `specs/living/cli/hooks.md`, `specs/living/cli/spec.md`, and `specs/living/dashboard/spec.md`.
   - Update workflow references in `specs/living/supporting-team-skills/spec.md` and `specs/living/docs/spec.md`.
   - Update affected files lists and inline references in active change specs 011 and 013.

4. **Verify**
   - Run `python3 scripts/validate-skills.py`.
   - Run `cd packages/cli && npm run build && npm test`.

## Notes

- Archived specs under `specs/archive/` were intentionally left unchanged because they record historical decisions.
- The skill directory `skills/orchestrator/` no longer exists; the canonical hub is `skills/crewloop-hub/`.
