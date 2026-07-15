# Routing Delta: Unified Skill Contracts

## Current State

Direct routing is canonical outside AFK, but local skill text contains contradictory predecessors, invokers, menus, and AFK targets. Only a subset of supporting skills defines AFK explicitly, and shared prefix documentation covers only core roles.

## Changes

### Direct Handoff After Selection
- The mandatory footer is removed after a menu selection.
- If the turn follows a prior interactive menu selection, continue directly into the chosen next skill without asking the user to type a command.
- No slash-command instruction should appear in the post-selection response.

### AFK Hub Mediation

- Every non-Hub skill skips its menu and returns control to CrewLoop Hub.
- CrewLoop Hub evaluates the completed phase and loads the next skill.
- Supporting skills never bypass the Hub in AFK mode.

### Supporting Invokers

- Outside AFK, supporting skills return directly to the actual invoking skill.
- Maintainer and Project Brainstorm are explicit exceptions: confirmed triage and completed briefs route to Architect.
- The manifest records the default invoker used when no explicit parent is available.
- When Hub is the invoker, the secondary option is Continue; otherwise the fallback is a new task through Hub.

### Validation

- `references/skill-contracts.yaml` is the authoring contract for identity and transitions.
- Every runtime skill keeps a concise inline transition capsule.
- CI rejects contract drift, malformed Markdown, broken relative links, or inventory mismatch.

### Unchanged
- The direct-routing workflow stays the same.
- `ask_question` remains the preferred menu mechanism.
- AFK still skips menus and routes through the CrewLoop Hub automatically.
- Role implementation, review, documentation, and git authority boundaries remain unchanged.
