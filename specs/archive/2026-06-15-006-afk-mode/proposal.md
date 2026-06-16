# Proposal: AFK Mode and Role Prefixes for Automatic Routing

## Problem

The Loop Engineering Agents workflow requires the user to manually choose the next skill at every handoff (`[A] Architect`, `[E] Engineer`, `[R] Reviewer`, `[S] Shipper`). This is good for explicit control, but it breaks flow when the user wants to delegate a complete task and step away.

## Objective

Add an **AFK mode** that, once explicitly activated by the user, makes the skills route automatically through the workflow without asking for confirmation at each step. Also add clear **role prefixes** to every skill response so the user always knows which skill is running.

## Scope

### In scope

- Detect AFK mode activation from explicit user messages (e.g., "estarei AFK", "modo AFK", "AFK").
- Persist AFK state in `MEMORY.md` so subsequent skills know the mode is active.
- Update all core skills to:
  - Print a role prefix at the start of the first response.
  - Skip navigation menus when AFK mode is active.
  - Automatically route to the next skill in the workflow.
- Document the prefixes and routing rules in `references/conventions.md`.

### Out of scope

- Changing the underlying workflow order.
- Adding new roles.
- Persisting AFK state beyond the current task/session.

## Constraints

- AFK mode must be opt-in per task; the user must explicitly activate it.
- Role prefixes must be short, consistent, and appear before any other content.
- No behavior change when AFK mode is not active.
