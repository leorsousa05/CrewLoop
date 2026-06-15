from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class Note:
    path: str
    title: str
    content: str
    frontmatter: dict[str, Any] = field(default_factory=dict)
    links: list[str] = field(default_factory=list)
    backlinks: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    ctime: datetime | None = None
    mtime: datetime | None = None


@dataclass
class Chunk:
    id: str
    note_path: str
    text: str
    embedding: list[float] | None = None
    start_line: int = 0
    end_line: int = 0


@dataclass
class GraphEdge:
    source: str
    target: str
    relation: str = "links"
    weight: float = 1.0


@dataclass
class SearchResult:
    note_path: str
    score: float
    snippet: str
    matched_chunks: list[Chunk] = field(default_factory=list)
