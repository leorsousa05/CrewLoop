# Proposal: Add fallback instructions when Obsidian vault or MCP is unavailable

## Problem

The `obsidian-second-brain` skill assumes the local Obsidian vault at `~/.lea` and the `obsidian-mcp` server are always available. It provides no guidance for agents when:

- The MCP tools are not registered in the current environment.
- The `~/.lea` vault does not exist.
- The Obsidian MCP server is offline or unreachable.

In these cases, the calling skill (e.g., `shipper`) is left without instructions on how to proceed, which can block or confuse the workflow.

## Why now

The bundle is designed to run in varied environments. A robust skill should degrade gracefully when optional infrastructure is missing, rather than fail silently or leave the agent stranded.

## Scope

In scope:
- Add a "Fallback / No Vault" section to `skills/obsidian-second-brain/SKILL.md`.
- Instruct the agent to detect unavailability of MCP tools or `~/.lea` and continue using in-session context only.
- Instruct the agent to report the situation briefly to the user when persistence is skipped.

Out of scope:
- Implementing a replacement memory system.
- Changing other skills' behavior beyond making the fallback explicit.
