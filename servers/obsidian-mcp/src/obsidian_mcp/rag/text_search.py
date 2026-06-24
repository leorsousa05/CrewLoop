import logging

from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.models import SearchResult

logger = logging.getLogger(__name__)


class TextSearch:
    def __init__(self, store: IndexStore):
        self.store = store

    def search(self, query: str, limit: int = 10) -> list[SearchResult]:
        query_lower = query.lower()
        chunks = self.store.get_all_chunks()
        logger.debug("text search over %d chunks", len(chunks))
        scored = []
        for chunk in chunks:
            text_lower = chunk.text.lower()
            score = 0.0
            if query_lower in text_lower:
                score = text_lower.count(query_lower) / max(len(text_lower.split()), 1)
            if score > 0:
                scored.append((score, chunk))
        scored.sort(key=lambda x: x[0], reverse=True)
        by_note = {}
        for score, chunk in scored[:limit * 3]:
            if chunk.note_path not in by_note:
                by_note[chunk.note_path] = SearchResult(
                    note_path=chunk.note_path,
                    score=score,
                    snippet=chunk.text[:300],
                    matched_chunks=[chunk],
                )
            else:
                by_note[chunk.note_path].matched_chunks.append(chunk)
        return sorted(by_note.values(), key=lambda r: r.score, reverse=True)[:limit]
