---
sidebar_position: 4
---

# Navigation and AFK Mode

## The navigation menu

At the end of each skill response, a letter-based navigation menu is presented:

```
**What would you like to do?**

- **[A] Send to Architect** — Create specs
- **[D] Send to Designer** — Visual direction
- **[E] Send to Engineer** — Implementation
- **[R] Send to Reviewer** — Quality gate
- **[S] Send to Shipper** — Commit and push
- **[O] Return to Orchestrator** — Adjust scope
```

Each skill shows only the letters relevant to its handoff. Skills always wait for explicit user confirmation before routing. The only exception is AFK mode.

## AFK mode

AFK mode lets the workflow run automatically without requiring navigation input between skills.

### Activation

Say one of:
- `AFK`
- `modo AFK`
- `vou ficar AFK`

Or add `afk: true` to `MEMORY.md` in the project root.

### Behavior when active

- Skills skip the navigation menu.
- Each response starts with the skill role prefix on its own line:
  ```
  [ENGINEER BUILDING]
  [REVIEWER INSPECTING]
  [SHIPPER COMMITTING]
  ```
- Skills load the next skill automatically without waiting for user input.
- Standard routing rules still apply.

### Deactivation

AFK mode ends when the Shipper completes and returns control to the Orchestrator.
