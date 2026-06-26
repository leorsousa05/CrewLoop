# Proposal: Remove Obsidian Second Brain and MCP Server

## Why

The Obsidian-based second brain and its MCP server added significant scope and operational complexity to the CrewLoop bundle. The user has decided to replace it with a different implementation in the future and wants to remove all related code, docs, and references now.

## Goal

Eliminate every active reference to Obsidian, second brain, `~/.lea`, and the `obsidian-mcp` server from the repository, while preserving historical records in `specs/archive/`.

## Scope

- Delete `servers/obsidian-mcp/`.
- Delete `skills/obsidian-second-brain/`.
- Delete `docs/docs/supporting/obsidian-second-brain.md`.
- Delete `references/obsidian-mcp-usage.md`.
- Delete `specs/living/obsidian-mcp/` and `specs/living/obsidian-second-brain/`.
- Delete Obsidian-related ADRs in `specs/decisions/`.
- Update `AGENTS.md`, `README.md`, `package.json`, `docs/sidebars.js`, and skill files to remove references.
- Update the CLI to stop installing the Obsidian MCP server.
- Update dashboard skill registry to remove the obsidian icon.
