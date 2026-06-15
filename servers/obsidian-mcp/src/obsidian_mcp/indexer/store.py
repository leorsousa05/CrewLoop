import json
import sqlite3
from pathlib import Path

from obsidian_mcp.models import Chunk, GraphEdge


class IndexStore:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS chunks (
                    id TEXT PRIMARY KEY,
                    note_path TEXT NOT NULL,
                    text TEXT NOT NULL,
                    embedding TEXT,
                    start_line INTEGER,
                    end_line INTEGER,
                    mtime REAL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS edges (
                    source TEXT NOT NULL,
                    target TEXT NOT NULL,
                    relation TEXT NOT NULL,
                    weight REAL,
                    PRIMARY KEY (source, target, relation)
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS notes_meta (
                    path TEXT PRIMARY KEY,
                    mtime REAL,
                    hash TEXT
                )
            """)
            conn.commit()

    def get_note_meta(self, path: str) -> dict | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT mtime, hash FROM notes_meta WHERE path = ?", (path,)
            ).fetchone()
        if row is None:
            return None
        return {"mtime": row[0], "hash": row[1]}

    def upsert_note_meta(self, path: str, mtime: float, hash: str):
        with self._connect() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO notes_meta (path, mtime, hash) VALUES (?, ?, ?)",
                (path, mtime, hash),
            )
            conn.commit()

    def delete_chunks_for_note(self, note_path: str):
        with self._connect() as conn:
            conn.execute("DELETE FROM chunks WHERE note_path = ?", (note_path,))
            conn.commit()

    def upsert_chunks(self, chunks: list[Chunk]):
        with self._connect() as conn:
            for chunk in chunks:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO chunks
                    (id, note_path, text, embedding, start_line, end_line)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        chunk.id,
                        chunk.note_path,
                        chunk.text,
                        json.dumps(chunk.embedding) if chunk.embedding is not None else None,
                        chunk.start_line,
                        chunk.end_line,
                    ),
                )
            conn.commit()

    def get_all_chunks(self) -> list[Chunk]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, note_path, text, embedding, start_line, end_line FROM chunks"
            ).fetchall()
        return [
            Chunk(
                id=r[0],
                note_path=r[1],
                text=r[2],
                embedding=json.loads(r[3]) if r[3] else None,
                start_line=r[4],
                end_line=r[5],
            )
            for r in rows
        ]

    def delete_edges_for_note(self, note_path: str):
        with self._connect() as conn:
            conn.execute("DELETE FROM edges WHERE source = ?", (note_path,))
            conn.commit()

    def delete_backlinks(self):
        with self._connect() as conn:
            conn.execute("DELETE FROM edges WHERE relation = 'backlink'")
            conn.commit()

    def upsert_edges(self, edges: list[GraphEdge]):
        with self._connect() as conn:
            for edge in edges:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO edges (source, target, relation, weight)
                    VALUES (?, ?, ?, ?)
                    """,
                    (edge.source, edge.target, edge.relation, edge.weight),
                )
            conn.commit()

    def get_all_edges(self) -> list[GraphEdge]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT source, target, relation, weight FROM edges"
            ).fetchall()
        return [GraphEdge(source=r[0], target=r[1], relation=r[2], weight=r[3]) for r in rows]

    def clear(self):
        with self._connect() as conn:
            conn.execute("DELETE FROM chunks")
            conn.execute("DELETE FROM edges")
            conn.execute("DELETE FROM notes_meta")
            conn.commit()
