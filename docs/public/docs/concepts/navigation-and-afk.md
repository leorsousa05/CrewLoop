---
sidebar_position: 4
---

# Navigation and AFK Mode

## The navigation menu

Interactive skills present a letter-based navigation menu at the end of their response:

```
**What would you like to do?**

- **[A] Send to `crewloop:plan`** — Create specs
- **[D] Send to `crewloop:design`** — Visual direction
- **[C] Send to `crewloop:code`** — Implementation
- **[R] Send to `crewloop:review`** — Quality gate
- **[S] Send to `crewloop:ship`** — Commit and push
- **[O] Return to `crewloop:hub`** — Adjust scope
```

Each interactive skill shows only the letters relevant to its handoff and waits for explicit user confirmation. `crewloop:plan` and `crewloop:design` hand off directly after completing their phase. AFK mode removes menus from all skills.

## AFK mode

AFK mode lets the workflow run automatically without requiring navigation input between skills.

### Activation

Say one of:
- `AFK`
- `AFK mode`
- `going AFK`

Or add `afk: true` to `MEMORY.md` in the project root.

### Behavior when active

- Skills skip the navigation menu.
- Each response starts with the skill role prefix on its own line:
  ```
  > 🗺️ **CrewLoop Plan**
  > 🎨 **CrewLoop Design**
  > 🛠️ **CrewLoop Code**
  > 🔍 **CrewLoop Review**
  > 🚀 **CrewLoop Ship**
  ```
- Every non-Hub skill returns control to `crewloop:hub`, which loads the next skill without waiting for user input.
- Standard routing rules still apply.

### Deactivation

AFK mode ends when `crewloop:ship` completes and returns control to `crewloop:hub`.
