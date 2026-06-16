# Spec: AFK Mode and Role Prefixes

## Current state

Each skill ends by presenting a letter-based navigation menu and waiting for the user to choose the next skill. There is no standard way to identify which skill is speaking at a glance.

## Desired state

### AFK mode

When the user explicitly says they will be AFK (e.g., "Estarei AFK", "modo AFK", "AFK"), the workflow becomes autonomous:

1. **Orchestrator** detects AFK activation, sets `MEMORY.md` flag, and routes directly to **Architect**.
2. **Architect** creates specs and routes directly to **Engineer** (or **Designer** if UI is involved).
3. **Designer** creates design specs and routes directly to **Engineer**.
4. **Engineer** implements and routes directly to **Reviewer**.
5. **Reviewer** reviews and routes directly to **Shipper**.
6. **Shipper** commits/pushes and routes back to **Orchestrator**.

At each handoff, the skill states the next skill being activated instead of asking the user.

### Role prefixes

Every skill response must start with a prefix identifying the active skill:

| Skill | Prefix |
|-------|--------|
| Orchestrator | `[ORCHESTRATOR TALKING]` |
| Architect | `[ARCHITECT ANALYZING]` |
| Designer | `[DESIGNER DESIGNING]` |
| Engineer | `[ENGINEER BUILDING]` |
| Reviewer | `[REVIEWER REVIEWING]` |
| Shipper | `[SHIPPER SHIPPING]` |

The prefix appears on its own line before the rest of the response.

### Detection rules

A skill should treat AFK mode as active if any of the following is true:
- The current user message contains an explicit AFK marker (case-insensitive): `AFK`, `estarei AFK`, `modo AFK`, `vou ficar AFK`.
- `MEMORY.md` contains `afk: true`.

### Reset

AFK mode resets when the workflow returns to Orchestrator after shipping, or when the user explicitly disables it.

## Files changed

- `references/conventions.md`
- `skills/orchestrator/SKILL.md`
- `skills/architect/SKILL.md`
- `skills/designer/SKILL.md`
- `skills/engineer/SKILL.md`
- `skills/reviewer/SKILL.md`
- `skills/shipper/SKILL.md`
