# Obsidian Second Brain

**Phase:** Memory & RAG

The Obsidian Second Brain skill uses a local Obsidian vault (`~/.lea`) connected via the `obsidian-mcp` server to retrieve prior knowledge and persist new concepts and decisions.

## When to use

- Knowledge retrieval across sessions.
- Persist decisions, reusable patterns, or session outcomes.
- Build project dashboards or summaries.

## Fallback

If the Obsidian MCP server is unavailable or `~/.lea` does not exist, the skill gracefully skips vault operations and continues using in-session context only.

## Next skill

Returns to **Orchestrator** or the skill that invoked it.
