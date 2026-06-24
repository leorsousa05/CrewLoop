# Design: obsidian-mcp Server Improvements

## Architecture

The server keeps its existing layered architecture:

```
server.py          → MCP protocol handlers (async)
tools/             → request validation + response shaping (async)
vault/             → filesystem abstraction (sync I/O, called from async)
rag/               → search implementations (sync, called from async)
privacy/           → content validation (sync, called from async)
```

The change is a **non-breaking refactor**: tool interfaces stay the same, but the execution path becomes non-blocking and the output of `read_note` becomes faithful to disk.

## Async Pattern

`server.py` currently has:

```python
async def call_tool(self, name: str, arguments: dict) -> ...:
    ...
    result = handler(arguments, self.config)
```

It becomes:

```python
async def call_tool(self, name: str, arguments: dict) -> ...:
    ...
    if asyncio.iscoroutinefunction(handler):
        result = await handler(arguments, self.config)
    else:
        result = await asyncio.to_thread(handler, arguments, self.config)
```

Each `tools/*.py` handler may be rewritten as `async def` where natural (pure validation/response shaping) or left as sync where filesystem/RAG work dominates. Either form is acceptable as long as `call_tool` never blocks the event loop.

## `read_note` Fidelity

Current `handle_read_note` builds a synthetic string. It is replaced by:

```python
def handle_read_note(arguments: dict, config: Config) -> str:
    path = arguments.get("path")
    if not path:
        raise ValueError("path is required")
    vault = VaultRepository(config)
    full = vault._resolve(path)
    if not full.exists():
        raise FileNotFoundError(f"note not found: {path}")
    return full.read_text(encoding="utf-8")
```

Error handling remains unchanged (FileNotFoundError maps to MCP error code).

## TF-IDF Fallback

Introduce a `TfidfIndex` class in `rag/vector_search.py`:

```python
class TfidfIndex:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.matrix = None
        self.doc_ids = []

    def fit(self, docs: list[str], ids: list[str]) -> None:
        self.doc_ids = ids
        self.matrix = self.vectorizer.fit_transform(docs)

    def query(self, query: str, top_k: int = 10) -> list[tuple[str, float]]:
        qvec = self.vectorizer.transform([query])
        scores = cosine_similarity(qvec, self.matrix).flatten()
        ranked = np.argsort(scores)[::-1][:top_k]
        return [(self.doc_ids[i], float(scores[i])) for i in ranked if scores[i] > 0]
```

The index is built during `sync_from_bundle` or first search and cached in the search service.

## Privacy Filter Configuration

Extend `Config` to load privacy settings:

```python
class PrivacyConfig(BaseModel):
    enabled: bool = True
    block_emails: bool = True
    block_phones: bool = True
    block_credit_cards: bool = True
    block_env_patterns: bool = True
    allowed_strings: list[str] = []
```

`PrivacyFilter.validate` checks `self.config.enabled` first and returns immediately if disabled. Allowed strings bypass all other rules.

## Logging

Use `logging.getLogger(__name__)` in every module. Add a helper in `server.py`:

```python
@asynccontextmanager
async def log_tool(name: str, arguments: dict):
    logger.info("tool start: %s", name, extra={"arguments": arguments})
    start = time.perf_counter()
    try:
        yield
    except Exception as exc:
        logger.error("tool error: %s: %s", name, exc, exc_info=True)
        raise
    finally:
        elapsed = time.perf_counter() - start
        logger.info("tool end: %s (%.3fs)", name, elapsed)
```

## Directory Structure

```
servers/obsidian-mcp/
├── src/obsidian_mcp/
│   ├── server.py                  # modified: await async/sync tools
│   ├── tools/
│   │   ├── read.py                # modified: return raw content
│   │   ├── create.py              # modified: async-compatible
│   │   ├── update.py              # modified: async-compatible
│   │   ├── delete.py              # modified: async-compatible
│   │   ├── search.py              # modified: async-compatible
│   │   ├── list.py                # modified: async-compatible
│   │   ├── related.py             # modified: async-compatible
│   │   ├── sync.py                # modified: async-compatible
│   │   └── learn.py               # modified: async-compatible
│   ├── vault/
│   │   ├── repository.py          # unchanged
│   │   ├── writer.py              # unchanged
│   │   └── parser.py              # unchanged
│   ├── rag/
│   │   ├── vector_search.py       # modified: TfidfIndex
│   │   └── ...
│   ├── privacy/
│   │   └── filter.py              # modified: configurable rules
│   └── config.py                  # modified: PrivacyConfig
└── tests/
    ├── test_async_tools.py        # new
    ├── test_read_raw.py           # new
    ├── test_tfidf_fallback.py     # new
    ├── test_privacy_config.py     # new
    └── test_edge_cases.py         # new
```

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Changing `read_note` output breaks existing callers | `read_note` returning raw Markdown is the expected behavior; the current formatter is the anomaly. Update any tests that assert on the synthetic format. |
| Async wrapper increases complexity | Keep handlers mostly synchronous; only `call_tool` needs the wrapper. |
| TF-IDF index memory usage | Limit `max_features` and rebuild only on sync. |
| Privacy filter disabled by default is dangerous | Keep it enabled by default; allow explicit opt-out only via config. |

## Deferred

- Backup/undo before update/delete.
- Graph search over note content.
- Multi-encoding support beyond UTF-8 with replacement characters.
