import logging
import math

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from obsidian_mcp.indexer.embeddings import EmbedderFactory
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.models import SearchResult

logger = logging.getLogger(__name__)


class VectorSearch:
    def __init__(self, store: IndexStore, model_name: str):
        self.store = store
        self.model_name = model_name
        self.embedder = EmbedderFactory.create(model_name)

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(x * x for x in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def _embedding_search(
        self, query: str, chunks: list, limit: int
    ) -> list[SearchResult]:
        try:
            query_embedding = self.embedder.encode([query])[0]
        except Exception as exc:
            logger.warning("vector search failed: %s", exc)
            return []

        scored = []
        for chunk in chunks:
            if not chunk.embedding:
                continue
            score = self._cosine_similarity(query_embedding, chunk.embedding)
            if score > 0:
                scored.append((score, chunk))
        return self._rank_by_note(scored, limit)

    def _tfidf_search(self, query: str, chunks: list, limit: int) -> list[SearchResult]:
        if not chunks:
            return []
        texts = [query] + [c.text for c in chunks]
        matrix = TfidfVectorizer().fit_transform(texts)
        scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
        scored = [(float(score), chunk) for score, chunk in zip(scores, chunks) if score > 0]
        return self._rank_by_note(scored, limit)

    def _rank_by_note(
        self, scored: list[tuple[float, object]], limit: int
    ) -> list[SearchResult]:
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

    def search(self, query: str, limit: int = 10) -> list[SearchResult]:
        chunks = self.store.get_all_chunks()
        if not chunks:
            return []
        if self.embedder.uses_stored_embeddings():
            return self._embedding_search(query, chunks, limit)
        return self._tfidf_search(query, chunks, limit)
