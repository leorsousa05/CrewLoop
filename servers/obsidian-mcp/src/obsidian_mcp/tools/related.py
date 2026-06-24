import logging

from obsidian_mcp.config import Config
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.rag.engine import RAGEngine

logger = logging.getLogger(__name__)


def handle_get_related_notes(arguments: dict, config: Config) -> str:
    path = arguments.get("path")
    if not path:
        raise ValueError("path is required")
    depth = int(arguments.get("depth", 1))
    logger.info("getting related notes: path=%s depth=%d", path, depth)
    engine = RAGEngine(config, IndexStore(config.index_dir / "index.db"))
    results = engine.related(path, depth=depth)
    if not results:
        return "No related notes found."
    return "\n".join(f"- **{r.note_path}** (score: {r.score:.3f})" for r in results)
