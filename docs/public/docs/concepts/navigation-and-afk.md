---
sidebar_position: 4
---

# Navigation and AFK Mode

## The navigation menu

Interactive skills present a letter-based navigation menu at the end of their response:

```
**What would you like to do?**

- **[A] Send to Architect** — Create specs
- **[D] Send to Designer** — Visual direction
- **[E] Send to Engineer** — Implementation
- **[R] Send to Reviewer** — Quality gate
- **[S] Send to Shipper** — Commit and push
- **[O] Return to CrewLoop Hub** — Adjust scope
```

Each interactive skill shows only the letters relevant to its handoff and waits for explicit user confirmation. Architect and Designer are non-interactive: they hand off directly after completing their phase. AFK mode removes menus from all skills.

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
  > 🔧 **Engineer**
  > 🔍 **Reviewer**
  > 🚀 **Shipper**
  ```
- Every non-Hub skill returns control to CrewLoop Hub, which loads the next skill without waiting for user input.
- Standard routing rules still apply.

### Deactivation

AFK mode ends when the Shipper completes and returns control to the CrewLoop Hub.
