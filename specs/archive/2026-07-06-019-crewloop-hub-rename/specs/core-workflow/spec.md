# Specification: CrewLoop Hub Rename

## Delta vs Current System

### Renamed Components
- The central skill directory changes from `skills/orchestrator/` to `skills/crewloop-hub/`.
- The skill metadata `name` changes from `orchestrator` to `crewloop-hub`.
- User-facing labels change from `Orchestrator` to `CrewLoop Hub`.

### Updated References
- Repository-level guidance files (`AGENTS.md`, `README.md`, `references/*.md`) adopt the new name as the canonical central role.
- CLI defaults and hook commands use `crewloop-hub` as the default skill.
- Dashboard-facing labels, registries, and tests align with the new skill identifier.
- Docs site navigation and core skill pages link to the new file path.

### Preserved Behavior
- The Hub remains the discovery and routing entry point.
- The Hub still routes to Architect first.
- The workflow order and responsibilities of supporting/core skills do not change.

## Acceptance Notes
- The repo should not present `orchestrator` as the canonical brand name anymore.
- Existing workflow rules should continue to make sense with the new label.
