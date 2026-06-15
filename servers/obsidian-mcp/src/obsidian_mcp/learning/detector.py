import hashlib
import re

from obsidian_mcp.config import Config


class Learning:
    def __init__(self, type: str, title: str, body: str, tags: list[str]):
        self.type = type
        self.title = title
        self.body = body
        self.tags = tags
        self.id = hashlib.sha256(f"{type}:{title}".encode()).hexdigest()[:12]


class LearningDetector:
    def __init__(self, config: Config | None = None):
        self.config = config or Config()
        self._seen = set()

    def _slug(self, title: str) -> str:
        return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")

    def detect(self, text: str) -> list[Learning]:
        findings = []
        concept = self._extract_concept(text)
        if concept:
            findings.append(concept)
        decision = self._extract_decision(text)
        if decision:
            findings.append(decision)
        return [f for f in findings if f.id not in self._seen]

    def mark_seen(self, learnings: list[Learning]):
        for learning in learnings:
            self._seen.add(learning.id)

    def _extract_concept(self, text: str) -> Learning | None:
        match = re.search(
            r"(?i)(?:novo\s+)?(?:conceito|concept)\s*[:\-]?\s*([A-Z][A-Za-z0-9\s\-_]{2,60})",
            text,
        )
        if match:
            title = match.group(1).strip()
            return Learning(
                type="concept",
                title=title,
                body=text.strip(),
                tags=["concept", "auto-generated"],
            )
        return None

    def _extract_decision(self, text: str) -> Learning | None:
        match = re.search(
            r"(?i)(?:decidimos|decision|decis[ãa]o)\s+(?:que|to|by)?\s*[:\-]?\s*(.+?)(?:\.|\n)",
            text,
        )
        if match:
            title = match.group(1).strip()[:80]
            return Learning(
                type="decision",
                title=title,
                body=text.strip(),
                tags=["decision", "auto-generated"],
            )
        return None
