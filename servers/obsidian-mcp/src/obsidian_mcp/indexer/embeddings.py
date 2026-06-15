import hashlib
import logging
from typing import Protocol

from sklearn.feature_extraction.text import TfidfVectorizer

logger = logging.getLogger(__name__)


class Embedder(Protocol):
    def encode(self, texts: list[str]) -> list[list[float]]: ...
    def is_available(self) -> bool: ...
    def uses_stored_embeddings(self) -> bool: ...


class SentenceTransformerEmbedder:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self._model = None

    def _load(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except Exception as exc:
                logger.warning("sentence-transformers not available: %s", exc)
                raise

    def is_available(self) -> bool:
        try:
            from sentence_transformers import SentenceTransformer
            return SentenceTransformer is not None
        except Exception:
            return False

    def uses_stored_embeddings(self) -> bool:
        return True

    def encode(self, texts: list[str]) -> list[list[float]]:
        self._load()
        embeddings = self._model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        return [e.tolist() for e in embeddings]


class TfidfEmbedder:
    def __init__(self):
        self._vectorizer = TfidfVectorizer()
        self._fitted = False

    def is_available(self) -> bool:
        return True

    def uses_stored_embeddings(self) -> bool:
        return False

    def encode(self, texts: list[str]) -> list[list[float]]:
        if not self._fitted:
            matrix = self._vectorizer.fit_transform(texts)
            self._fitted = True
        else:
            matrix = self._vectorizer.transform(texts)
        return matrix.toarray().tolist()


class EmbedderFactory:
    @staticmethod
    def create(model_name: str) -> Embedder:
        st = SentenceTransformerEmbedder(model_name)
        if st.is_available():
            return st
        logger.warning("falling back to TF-IDF embedder")
        return TfidfEmbedder()


def chunk_text(text: str, chunk_size: int, overlap: int) -> list[tuple[str, int, int]]:
    if not text:
        return []
    chunks = []
    start = 0
    text_len = len(text)
    while start < text_len:
        end = min(start + chunk_size, text_len)
        if end < text_len:
            expanded = end
            while expanded < text_len and text[expanded] not in ("\n", " "):
                expanded += 1
            if expanded < text_len:
                end = expanded
        chunk_value = text[start:end].strip()
        if chunk_value:
            start_line = text.count("\n", 0, start) + 1
            end_line = text.count("\n", 0, end) + 1
            chunks.append((chunk_value, start_line, end_line))
        if end >= text_len:
            break
        next_start = end - overlap
        if next_start <= start:
            next_start = end
        start = next_start
    return chunks


def chunk_id(note_path: str, text: str) -> str:
    return hashlib.sha256(f"{note_path}:{text}".encode()).hexdigest()[:16]
