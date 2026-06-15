# Obsidian MCP Second Brain

Local MCP server that connects the `loop-engineering-agents` skill bundle to an Obsidian vault at `~/.lea`, acting as a second brain / RAG for AI agents.

## Installation

```bash
cd servers/obsidian-mcp
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

To use local sentence-transformer embeddings (heavier), install:

```bash
pip install -e ".[embeddings]"
```

Otherwise the server falls back to a lightweight TF-IDF embedder.

## Configuration in Kimi Code

Add to your `mcpServers` config (usually `~/.kimi-code/config.toml` or via the UI):

```toml
[mcpServers.obsidian-mcp]
command = "/path/to/servers/obsidian-mcp/.venv/bin/python"
args = ["-m", "obsidian_mcp.main"]
```

Or via JSON:

```json
{
  "mcpServers": {
    "obsidian-mcp": {
      "command": "/path/to/servers/obsidian-mcp/.venv/bin/python",
      "args": ["-m", "obsidian_mcp.main"]
    }
  }
}
```

## MCP Tools

- `read_note` — read a note from the vault
- `search_notes` — search by text, vector, graph, or hybrid
- `create_note` — create a new note
- `update_note` — update or append content to an existing note
- `delete_note` — delete a note
- `list_notes` — list notes in the vault
- `get_related_notes` — get related notes via links and graph traversal
- `sync_from_bundle` — re-index the bundle and local vault
- `learn_from_text` — detect concepts/decisions in text and create notes automatically

## First Use

1. Make sure Obsidian is installed.
2. Create / open the vault at `~/.lea` in Obsidian.
3. Run `sync_from_bundle` to index the bundle as the initial knowledge base.
4. Use `search_notes` to query knowledge.
5. Use `learn_from_text` whenever new concepts or decisions appear in conversation.

## Tests

```bash
pytest tests/ -q
```
