# Spec Delta: Skills (Team & Routing)

## Current State

Eight skills: `crewloop-hub`, `crewloop-plan`, `crewloop-design`, `crewloop-code`, `crewloop-review`, `crewloop-ship`, `crewloop-brainstorm`, `crewloop-docs`. The entry point is `crewloop-hub`, which routes to `crewloop-plan` or `crewloop-brainstorm`. Every interactive skill ends with a letter-based menu. `crewloop-brainstorm` handles ambiguous-project discovery and hands off to `crewloop-plan`.

## Changes

### ADDED
- New `crewloop:plan` skill that combines Hub discovery, Brainstorm ideation, and Plan spec-writing into a single entry point.

### MODIFIED
- `crewloop-design/SKILL.md` — transition contract becomes direct route to `crewloop:code`; no menu; AFK returns to `crewloop:plan`.
- `crewloop-code/SKILL.md` — transition contract becomes conditional route to `crewloop:review` (success) or `crewloop:plan` (failed build); no menu; AFK returns to `crewloop:plan`.
- `crewloop-review/SKILL.md` — transition contract becomes conditional route to `crewloop:ship` (PASS) or `crewloop:code` (FAIL); no menu; AFK returns to `crewloop:plan`.
- `crewloop-ship/SKILL.md` — transition contract becomes direct route to `done`; no menu; AFK returns to `crewloop:plan`.
- `crewloop-docs/SKILL.md` — default invoker becomes `crewloop:plan`; direct route back to `crewloop:plan`; no menu; AFK returns to `crewloop:plan`.

### REMOVED
- `skills/crewloop-hub/` directory and `SKILL.md`.
- `skills/crewloop-brainstorm/` directory and `SKILL.md`.

## Migration Notes

Existing installs will lose the `crewloop-hub` and `crewloop-brainstorm` directories on next `crewloop install`. The CLI default hook switches to `crewloop-plan`, so new sessions start with the new Plan skill.

## Backward Compatibility

Breaking: the Hub and Brainstorm skills disappear, and the default entry skill changes. The user explicitly requested this simplification. The dashboard gracefully degrades unknown skill names to the default icon.
