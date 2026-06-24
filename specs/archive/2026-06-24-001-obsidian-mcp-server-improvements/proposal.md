# Proposal: obsidian-mcp Server Improvements

## WHY

The local Obsidian MCP server (`servers/obsidian-mcp`) is the infrastructure layer that makes the `obsidian-second-brain` skill work. An end-to-end review revealed that, while functional, the server has robustness and correctness gaps that degrade the user experience and can block the agent during normal operation.

The most critical issues are:

1. **Synchronous tools inside an async MCP handler** block the event loop. `sync_from_bundle` and index operations can freeze the MCP client.
2. **`read_note` does not return the raw file content**. It reformats frontmatter and injects a `**Tags:**` line, producing a non-standard representation that confuses downstream LLM reasoning.
3. **The TF-IDF fallback for vector search is statistically incorrect**. It fits the vectorizer on `query + chunks` rather than on the corpus, giving misleading scores.
4. **The privacy filter is too aggressive**, blocking legitimate content such as email-like strings or common keywords.
5. **Operational logging is insufficient** to diagnose failures in production.

This change addresses these issues so that the second-brain integration is reliable, transparent, and truly useful end-to-end.

## Scope

- `servers/obsidian-mcp/src/obsidian_mcp/tools/*.py`
- `servers/obsidian-mcp/src/obsidian_mcp/vault/writer.py`
- `servers/obsidian-mcp/src/obsidian_mcp/vault/repository.py`
- `servers/obsidian-mcp/src/obsidian_mcp/vault/parser.py`
- `servers/obsidian-mcp/src/obsidian_mcp/rag/text_search.py` and related RAG modules
- `servers/obsidian-mcp/src/obsidian_mcp/privacy/filter.py`
- `servers/obsidian-mcp/src/obsidian_mcp/server.py`
- `servers/obsidian-mcp/tests/`

## Out of Scope

- Changes to skill files (`skills/obsidian-second-brain/SKILL.md`)
- Changes to reference documentation (`references/obsidian-mcp-usage.md`)
- UI/frontend work

## Success Criteria

- All MCP tool handlers are non-blocking.
- `read_note` returns the exact Markdown file content, including original frontmatter.
- Vector-search fallback produces corpus-based TF-IDF scores.
- Privacy filter can be configured and has documented behavior.
- New tests cover vault-empty, encoding-edge, embedding-failure, and async paths.
