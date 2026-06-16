# Design: AFK Mode and Role Prefixes

## Approach

Add a small, consistent "AFK Mode & Role Prefix" section to every core skill. The section defines:

1. How to detect AFK mode.
2. What prefix to print.
3. How to route automatically when AFK mode is active.

Centralize the prefix table and activation phrases in `references/conventions.md` so all skills reference the same definitions.

## Skill section template

Insert a new section immediately after `## MEMORY & CONTEXT`:

```markdown
## AFK MODE & ROLE PREFIX

**Role prefix:** `[ROLE VERB]`

Print this prefix at the start of the first response in every turn.

**AFK mode activation:**
- User says "AFK", "estarei AFK", "modo AFK", or similar explicit marker.
- `MEMORY.md` contains `afk: true`.

**AFK mode behavior:**
- Skip the navigation menu at the end.
- State the next skill being activated.
- Load the next skill via the Skill tool (do not wait for user choice).

**Next skill:**
- Orchestrator → Architect
- Architect → Designer (if UI) or Engineer
- Designer → Engineer
- Engineer → Reviewer
- Reviewer → Shipper
- Shipper → Orchestrator
```

Each skill uses its own prefix and next-skill mapping.

## Reference update

Add to `references/conventions.md` under a new "AFK Mode" section:

```markdown
## AFK Mode

When the user explicitly activates AFK mode, skills route automatically through the workflow without presenting navigation menus.

### Activation phrases

Case-insensitive matches: `AFK`, `estarei AFK`, `modo AFK`, `vou ficar AFK`.

### Role prefixes

| Skill | Prefix |
|-------|--------|
| Orchestrator | `[ORCHESTRATOR TALKING]` |
| Architect | `[ARCHITECT ANALYZING]` |
| Designer | `[DESIGNER DESIGNING]` |
| Engineer | `[ENGINEER BUILDING]` |
| Reviewer | `[REVIEWER REVIEWING]` |
| Shipper | `[SHIPPER SHIPPING]` |

### Automatic routing

When AFK mode is active, each skill proceeds to the next role in the standard workflow without waiting for user confirmation.
```

## No subagents

The change is a documentation update across skill files. The same section template applies to each skill, so a single engineer pass is sufficient.

## Verification

- `python3 scripts/validate-skills.py` must pass.
- Each core skill file must contain its role prefix and AFK mode section.
- `references/conventions.md` must contain the prefix table and activation rules.
