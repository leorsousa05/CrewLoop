import logging

from obsidian_mcp.config import Config
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.rag.engine import RAGEngine

logger = logging.getLogger(__name__)


def handle_search_notes(arguments: dict, config: Config) -> str:
    query = arguments.get("query")
    if not query:
        raise ValueError("query is required")
    mode = arguments.get("mode", "hybrid")
    limit = int(arguments.get("limit", 10))
    logger.info("searching notes: mode=%s query=%r limit=%d", mode, query, limit)
    engine = RAGEngine(config, IndexStore(config.index_dir / "index.db"))
    results = engine.search(query, mode=mode, limit=limit)
    if not results:
        return "No results found."
    lines = []
    for r in results:
        lines.append(f"- **{r.note_path}** (score: {r.score:.3f})")
        if r.snippet:
            lines.append(f"  {r.snippet[:200].replace(chr(10), ' ')}")
    return "\n".join(lines)
