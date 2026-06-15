from obsidian_mcp.config import Config
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.models import SearchResult
from obsidian_mcp.rag.graph_search import GraphSearch
from obsidian_mcp.rag.text_search import TextSearch
from obsidian_mcp.rag.vector_search import VectorSearch


class RAGEngine:
    def __init__(self, config: Config, store: IndexStore):
        self.config = config
        self.text_search = TextSearch(store)
        self.vector_search = VectorSearch(store, config.embedding_model)
        self.graph_search = GraphSearch(store)

    @staticmethod
    def _normalize_scores(results: list[SearchResult]) -> list[SearchResult]:
        if len(results) < 2:
            return results
        scores = [r.score for r in results]
        min_score = min(scores)
        max_score = max(scores)
        span = max_score - min_score
        for result in results:
            result.score = 1.0 if span == 0 else (result.score - min_score) / span
        return results

    def search(self, query: str, mode: str = "hybrid", limit: int = 10) -> list[SearchResult]:
        results = []
        if mode in ("text", "hybrid"):
            results.extend(self._normalize_scores(self.text_search.search(query, limit=limit)))
        if mode in ("vector", "hybrid"):
            results.extend(self._normalize_scores(self.vector_search.search(query, limit=limit)))
        if mode == "graph":
            results.extend(self._normalize_scores(self.graph_search.search(query, limit=limit)))

        by_note = {}
        for result in results:
            if result.note_path not in by_note:
                by_note[result.note_path] = result
            else:
                by_note[result.note_path].score = max(
                    by_note[result.note_path].score, result.score
                )
                by_note[result.note_path].matched_chunks.extend(result.matched_chunks)

        return sorted(by_note.values(), key=lambda r: r.score, reverse=True)[:limit]

    def related(self, note_path: str, depth: int = 1) -> list[SearchResult]:
        return self.graph_search.related(note_path, depth=depth)
