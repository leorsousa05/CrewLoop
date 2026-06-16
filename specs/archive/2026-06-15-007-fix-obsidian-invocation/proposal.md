# Proposal: Fix Obsidian Second Brain Invocation

## Problem

The Memory & Context sections in the skills say "use the `obsidian-second-brain` skill to..." but they do not explicitly instruct the agent to **invoke the skill via the `Skill` tool**. As a result, the agent interprets the instruction as "read `AGENT.md` and `MEMORY.md` directly with the `Read` tool", bypassing the MCP layer entirely. When the vault files do not exist in the current context, the reads fail.

## Objective

Make the invocation explicit: each skill must load `obsidian-second-brain` with the `Skill` tool and let that skill handle vault reads, searches, and persistence through the MCP server.

## Scope

### In scope

- Update the Memory & Context section in all skills that have it.
- Update the centralized pattern in `references/obsidian-mcp-usage.md`.
- Add a note about graceful fallback when the vault or MCP is unavailable.

### Out of scope

- Changing the vault architecture.
- Changing the Obsidian MCP server.
- Adding new skills.

## Constraints

- No behavior change when the vault is available.
- The instruction must be compatible with agents that support the `Skill` tool.
- Keep the sections concise.
