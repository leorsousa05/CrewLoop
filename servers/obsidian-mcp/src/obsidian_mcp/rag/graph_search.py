import logging
from collections import deque

from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.models import SearchResult

logger = logging.getLogger(__name__)


class GraphSearch:
    def __init__(self, store: IndexStore):
        self.store = store

    def related(self, note_path: str, depth: int = 1) -> list[SearchResult]:
        edges = self.store.get_all_edges()
        logger.debug("graph related search: %s depth=%d edges=%d", note_path, depth, len(edges))
        adjacency = {}
        for edge in edges:
            adjacency.setdefault(edge.source, []).append((edge.target, edge.weight))

        visited = {note_path}
        queue = deque([(note_path, 0, 1.0)])
        scores = {}
        while queue:
            current, level, weight = queue.popleft()
            for target, edge_weight in adjacency.get(current, []):
                if target in visited:
                    continue
                score = weight * edge_weight * (1.0 / (level + 1))
                scores[target] = max(scores.get(target, 0.0), score)
                if level + 1 < depth:
                    visited.add(target)
                    queue.append((target, level + 1, score))
        return [
            SearchResult(note_path=path, score=score, snippet="", matched_chunks=[])
            for path, score in sorted(scores.items(), key=lambda x: x[1], reverse=True)
        ]

    def search(self, query: str, limit: int = 10) -> list[SearchResult]:
        terms = [t.lower() for t in query.split() if t]
        if not terms:
            return []
        edges = self.store.get_all_edges()
        logger.debug("graph search: query=%r edges=%d", query, len(edges))
        scores = {}
        for edge in edges:
            for node in (edge.source, edge.target):
                node_lower = node.lower()
                score = sum(1 for term in terms if term in node_lower)
                if score:
                    scores[node] = max(scores.get(node, 0.0), score * edge.weight)
        return [
            SearchResult(note_path=path, score=score, snippet="", matched_chunks=[])
            for path, score in sorted(scores.items(), key=lambda x: x[1], reverse=True)[:limit]
        ]
