# Spec: obsidian-mcp Server Improvements

## Current State

The MCP server exposes tools that read, write, search, and manage notes in the `~/.lea` vault. The implementation is synchronous Python invoked from an async `call_tool` handler. Several behaviors deviate from what callers expect.

### ADDED

No new tools are added. Existing tools are modified.

### MODIFIED

#### 1. Async Tool Handlers

All tool handlers in `servers/obsidian-mcp/src/obsidian_mcp/tools/` must be converted to async coroutines or wrapped with `asyncio.to_thread` when called from `server.py`. The public `call_tool` handler must `await` them.

Affected tools:
- `read_note`
- `create_note`
- `update_note`
- `delete_note`
- `search_notes`
- `list_notes`
- `get_related_notes`
- `sync_from_bundle`
- `learn_from_text`

#### 2. Fidelity of `read_note`

`read_note` must return the exact bytes of the Markdown file as stored on disk, decoded as UTF-8. The current formatter that produces `# Title`, `**Tags:**`, and flattened frontmatter lines must be removed or replaced by a dedicated diagnostic view.

The Note model may still parse frontmatter internally, but the tool output must be the raw file content.

#### 3. Vector-Search TF-IDF Fallback

The fallback in `rag/vector_search.py` (or wherever embedding fallback lives) must:
- Fit a `TfidfVectorizer` on the indexed corpus once per index build.
- Transform the query against the fitted vectorizer.
- Return cosine-similarity scores between query vector and corpus vectors.

The current behavior of fitting on `query + chunks` per request is removed.

#### 4. Privacy Filter Configuration

`PrivacyFilter` must accept configuration from `obsidian_mcp.config.Config` to:
- Enable/disable the filter globally.
- Toggle individual rules (PII, emails, keywords, etc.).
- Allow a user-defined allow-list of strings that should never be blocked.

When disabled, validation becomes a no-op.

#### 5. Structured Logging

Add module-level loggers with `logging.getLogger(__name__)` across all tools and RAG modules. Log at appropriate levels:
- INFO: tool start/end, vault path, index size
- DEBUG: search parameters, parsed frontmatter, merge details
- WARNING: missing files, invalid frontmatter, embedding fallback activation, privacy filter hits
- ERROR: unhandled exceptions

Include execution time per tool call.

### REMOVED

- The `read_note` formatter that produces synthetic `# Title`, `**Tags:**`, and flattened frontmatter.

## Acceptance Criteria

- [ ] `pytest` passes with at least 55 tests.
- [ ] New tests verify async behavior (event loop is not blocked during `sync_from_bundle`).
- [ ] New tests verify `read_note` returns raw content identical to the file on disk.
- [ ] New tests verify TF-IDF fallback uses a corpus-fitted vectorizer.
- [ ] New tests verify privacy filter can be disabled via config.
- [ ] New tests cover vault-empty search and read paths.
- [ ] New tests cover non-UTF-8 / binary-like file handling.
