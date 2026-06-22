# Proposal: Align navigation-menu rules and local reference instructions

## Problem

After fixing the objective errors in `001-fix-skill-metadata-errors`, three consistency issues remain:

1. **Navigation menus do not match `AGENTS.md` rule.** `AGENTS.md:107` demands the full menu `[A] Architect, [D] Designer, [E] Engineer, [R] Reviewer, [S] Shipper, [O] Orchestrator` at the end of every skill, but each skill only shows the options relevant to its handoff.
2. **AFK mode contradicts the "never route automatically" rule.** Every main skill has an AFK mode that skips the menu and loads the next skill automatically.
3. **Local reference directories are referenced as if they always exist.** Most skills tell the agent to read files in local `references/` or `assets/`, but only `architect/references/templates/` and `docs-writer/references/` actually exist.

## Why now

These are not cosmetic issues. They create internal contradictions in the bundle's instructions, which reduces agent reliability and makes the rules harder to follow.

## Scope

In scope:
- Update `AGENTS.md` to allow context-aware navigation menus and explicitly document AFK mode as an exception.
- Adjust the mandatory-reference paragraph in each skill to say local files/directories should be read only if they exist.

Out of scope:
- Changing the actual options shown by each skill (they are already contextually correct).
- Creating empty `references/` or `assets/` directories where none exist.
