# Tasks: obsidian-mcp Server Improvements

## Phase 1 — Async Foundation

- [ ] Add `asyncio.to_thread` wrapper in `server.py::call_tool` for sync handlers.
- [ ] Convert pure validation/response handlers in `tools/*.py` to `async def` where beneficial.
- [ ] Add execution-time logging around tool calls.
- [ ] Run existing tests to ensure no regressions.

## Phase 2 — Read Fidelity

- [ ] Rewrite `tools/read.py::handle_read_note` to return raw file content.
- [ ] Remove synthetic formatter (`_format_frontmatter_value`, header injection, tag line).
- [ ] Update existing tests that assert on synthetic output.
- [ ] Add test verifying byte-for-byte fidelity with on-disk file.

## Phase 3 — Search Fallback

- [ ] Implement `TfidfIndex` in `rag/vector_search.py`.
- [ ] Fit vectorizer on corpus during sync or first search.
- [ ] Replace per-request `query + chunks` fitting.
- [ ] Add tests for fallback scoring correctness.

## Phase 4 — Privacy Filter

- [ ] Add `PrivacyConfig` to `config.py`.
- [ ] Update `PrivacyFilter` to read config and support enable/disable plus rule toggles.
- [ ] Add allow-list bypass.
- [ ] Add tests for disabled filter and allow-list.

## Phase 5 — Logging & Edge Cases

- [ ] Add module-level loggers to all tools and RAG modules.
- [ ] Add tests for empty vault search/read.
- [ ] Add tests for non-UTF-8 file handling.
- [ ] Add tests for embedding failure fallback.
- [ ] Verify full test suite passes.
