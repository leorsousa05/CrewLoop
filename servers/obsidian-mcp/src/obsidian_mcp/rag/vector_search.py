import logging
import math

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from obsidian_mcp.indexer.embeddings import EmbedderFactory
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.models import Chunk, SearchResult

logger = logging.getLogger(__name__)


class TfidfIndex:
    def __init__(self, max_features: int = 50000):
        self.vectorizer = TfidfVectorizer(max_features=max_features)
        self.matrix = None
        self.doc_ids: list[str] = []

    def fit(self, chunks: list[Chunk]) -> None:
        if not chunks:
            self.matrix = None
            self.doc_ids = []
            return
        self.doc_ids = [chunk.id for chunk in chunks]
        texts = [chunk.text for chunk in chunks]
        self.matrix = self.vectorizer.fit_transform(texts)
        logger.info("TF-IDF index fitted on %d chunks", len(chunks))

    def query(self, query: str, top_k: int = 10) -> list[tuple[str, float]]:
        if self.matrix is None or not self.doc_ids:
            return []
        qvec = self.vectorizer.transform([query])
        scores = cosine_similarity(qvec, self.matrix).flatten()
        ranked = np.argsort(scores)[::-1][:top_k]
        return [(self.doc_ids[i], float(scores[i])) for i in ranked if scores[i] > 0]


class VectorSearch:
    def __init__(self, store: IndexStore, model_name: str):
        self.store = store
        self.model_name = model_name
        self.embedder = EmbedderFactory.create(model_name)
        self._tfidf_index: TfidfIndex | None = None
        self._tfidf_chunk_count: int = 0

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(x * x for x in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def _embedding_search(
        self, query: str, chunks: list[Chunk], limit: int
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

    def _ensure_tfidf_index(self, chunks: list[Chunk]) -> TfidfIndex:
        if self._tfidf_index is None or self._tfidf_chunk_count != len(chunks):
            self._tfidf_index = TfidfIndex()
            self._tfidf_index.fit(chunks)
            self._tfidf_chunk_count = len(chunks)
        return self._tfidf_index

    def _tfidf_search(self, query: str, chunks: list[Chunk], limit: int) -> list[SearchResult]:
        if not chunks:
            return []
        index = self._ensure_tfidf_index(chunks)
        id_to_chunk = {chunk.id: chunk for chunk in chunks}
        results = index.query(query, top_k=limit * 3)
        scored = [
            (score, id_to_chunk[doc_id])
            for doc_id, score in results
            if doc_id in id_to_chunk
        ]
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
            logger.warning("vector search requested but no chunks are indexed")
            return []
        if self.embedder.uses_stored_embeddings():
            return self._embedding_search(query, chunks, limit)
        return self._tfidf_search(query, chunks, limit)
