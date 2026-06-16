# Proposal: Force Obsidian Second Brain Invocation via Skill Tool

## Problem

Even after adding the instruction to invoke `obsidian-second-brain` via the `Skill` tool, agents still read vault files directly using the `Read` tool. The likely cause is that the Memory & Context sections still list concrete file paths (`MEMORY.md`, `Memory/preferences.md`) as read targets, which agents interpret as direct file reads.

## Objective

Make `obsidian-second-brain` the **only** entry point for vault access. Prohibit direct reads/writes of vault files and rephrase per-skill targets as search intents rather than file paths.

## Scope

### In scope

- Update the centralized Memory & Context pattern in `references/obsidian-mcp-usage.md`.
- Update all skill Memory & Context sections.
- Update the `obsidian-second-brain` skill to emphasize that it must be invoked via the `Skill` tool.

### Out of scope

- Changing the vault architecture.
- Changing MCP server behavior.

## Constraints

- Agents must never use `Read`, `Edit`, `Write`, or `Bash` directly on files inside `~/.lea`.
- The skill instructions must be unambiguous enough to override the agent's tendency to read files directly.
