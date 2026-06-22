# Proposal: Fix skill metadata errors

## Problem

Validation of `skills/orchestrator/SKILL.md` revealed three categories of issues that were later found to be replicated across multiple skills in the bundle:

1. **Absolute Linux paths** in mandatory reference links (`file:///home/arch/...`) that do not resolve on the target Windows environment (`C:/Users/guilh/...`).
2. **Duplicated section numbering** (`2.7`) in `orchestrator/SKILL.md`.
3. **Navigation menus** that do not match the letter-based menu declared in `AGENTS.md`.
4. **References to local `references/` or `assets/` directories** that do not exist for most skills.

These issues reduce the reliability of the skills when consumed by agents on non-Linux systems and create internal contradictions in the workflow documentation.

## Why now

The bundle is documentation-first; its only value is the precision of its instructions. Broken links and inconsistent rules directly undermine the orchestrator → architect → designer → engineer → reviewer → shipper flow.

## Scope

In scope:
- Replace absolute `file:///home/arch/...` paths with relative paths in all affected `SKILL.md` files.
- Fix the duplicated `2.7` section in `orchestrator/SKILL.md`.
- Document the navigation-menu inconsistency for a future decision (this change focuses on objective errors).

Out of scope:
- Rewriting `AGENTS.md` navigation rule.
- Removing AFK-mode behavior.
- Creating missing local `references/` or `assets/` directories.
