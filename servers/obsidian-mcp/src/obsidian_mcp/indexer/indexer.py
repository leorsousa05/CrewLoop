import hashlib
import logging

from obsidian_mcp.config import Config
from obsidian_mcp.indexer.embeddings import EmbedderFactory, chunk_id, chunk_text
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.models import Chunk, GraphEdge, Note
from obsidian_mcp.vault.repository import VaultRepository

logger = logging.getLogger(__name__)


class Indexer:
    def __init__(self, config: Config, vault: VaultRepository, store: IndexStore | None = None):
        self.config = config
        self.vault = vault
        self.store = store or IndexStore(config.index_dir / "index.db")
        self.embedder = EmbedderFactory.create(config.embedding_model)

    def _hash(self, text: str) -> str:
        return hashlib.sha256(text.encode()).hexdigest()[:16]

    def index_note(self, note: Note, force: bool = False):
        meta = self.store.get_note_meta(note.path)
        mtime = note.mtime.timestamp() if note.mtime else 0.0
        content_hash = self._hash(note.content)
        if not force and meta and meta["mtime"] == mtime and meta["hash"] == content_hash:
            return

        self.store.delete_chunks_for_note(note.path)
        self.store.delete_edges_for_note(note.path)

        chunks_data = chunk_text(note.content, self.config.chunk_size, self.config.chunk_overlap)
        chunks = [
            Chunk(
                id=chunk_id(note.path, text),
                note_path=note.path,
                text=text,
                start_line=start,
                end_line=end,
            )
            for text, start, end in chunks_data
        ]

        if chunks and self.embedder.uses_stored_embeddings():
            try:
                embeddings = self.embedder.encode([c.text for c in chunks])
                for chunk, emb in zip(chunks, embeddings):
                    chunk.embedding = emb
            except Exception as exc:
                logger.warning("embedding failed for %s: %s", note.path, exc)

        self.store.upsert_chunks(chunks)

        edges = [
            GraphEdge(source=note.path, target=target, relation="links", weight=1.0)
            for target in note.links
        ]
        self.store.upsert_edges(edges)
        self.store.upsert_note_meta(note.path, mtime, content_hash)

    def index_all(self, force: bool = False):
        notes = self.vault.read_all()
        for note in notes:
            self.index_note(note, force=force)

    def compute_backlinks(self):
        self.store.delete_backlinks()
        edges = self.store.get_all_edges()
        targets = {}
        for edge in edges:
            if edge.relation == "links":
                targets.setdefault(edge.target, []).append(edge.source)
        backlink_edges = [
            GraphEdge(source=target, target=source, relation="backlink", weight=0.8)
            for target, sources in targets.items()
            for source in sources
        ]
        self.store.upsert_edges(backlink_edges)
