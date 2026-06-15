# Obsidian MCP Second Brain — Usage for Agents

This document explains how the Loop Engineering Agents team should use the local Obsidian MCP server (`servers/obsidian-mcp`).

## What It Is

A local MCP server exposes a vault at `~/.lea` as a second brain. The AI can:

- Search existing knowledge (bundle + vault notes).
- Read notes.
- Create and update notes.
- Learn from conversation text automatically via `learn_from_text`.

## When to Use

Use these tools whenever context would be useful across sessions or tasks:

- Before answering, search for relevant prior knowledge.
- After making a decision, create or update a decision note.
- After discovering a new concept, call `learn_from_text`.
- When a user refers to something that may exist in the vault, use `search_notes`.

## Available MCP Tools

| Tool | Purpose |
|------|---------|
| `search_notes` | Find relevant notes. Prefer `mode: "hybrid"`. |
| `read_note` | Read a specific note by path. |
| `create_note` | Create a new note. Use folders like `concepts/`, `decisions/`, `projects/`. |
| `update_note` | Append or replace content. Use `append` to preserve history. |
| `delete_note` | Remove a note. Use sparingly. |
| `list_notes` | List notes, optionally filtered by folder. |
| `get_related_notes` | Explore graph relationships from a note. |
| `sync_from_bundle` | Re-index the skill bundle as the knowledge base. |
| `learn_from_text` | Detect concepts/decisions in text and auto-create notes. |

## Recommended Workflow

1. **Onboarding / after installation:** call `sync_from_bundle` once to index the bundle.
2. **During a task:**
   - Call `search_notes` with the user's topic.
   - If a relevant note exists, `read_note` it.
   - If a new concept or decision emerges, call `learn_from_text`.
3. **At the end of a significant task:**
   - Summarize decisions or concepts.
   - Use `create_note` or `learn_from_text` to persist them.

## Note Organization

Use English folder names:

- `concepts/` — ideas, patterns, definitions
- `decisions/` — architectural or process decisions
- `projects/` — project-specific notes

Example paths:

- `concepts/graph-rag.md`
- `decisions/vault-local-path.md`
- `projects/mcp-integration.md`

## Privacy Rules

Never persist in the vault:

- API keys, secrets, tokens, passwords
- Private keys or certificates
- `.env` contents
- Personal identifiable information (PII)

The server has a privacy filter, but avoid sensitive input regardless.

## Configuration Reminder

The server must be installed and added to the agent's MCP config:

```toml
[mcpServers.obsidian-mcp]
command = "/path/to/servers/obsidian-mcp/.venv/bin/python"
args = ["-m", "obsidian_mcp.main"]
```

See `servers/obsidian-mcp/README.md` for full setup instructions.
