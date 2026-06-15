import re
from datetime import datetime, timezone

from obsidian_mcp.config import Config
from obsidian_mcp.learning.detector import Learning
from obsidian_mcp.models import Note
from obsidian_mcp.vault.repository import VaultRepository


class NoteGenerator:
    def __init__(self, config: Config, vault: VaultRepository):
        self.config = config
        self.vault = vault

    def _slug(self, title: str) -> str:
        return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:60]

    def path_for(self, learning: Learning) -> str:
        folder = "concepts" if learning.type == "concept" else "decisions"
        return f"{folder}/{self._slug(learning.title)}.md"

    def to_note(self, learning: Learning) -> Note:
        now = datetime.now(timezone.utc).isoformat()
        return Note(
            path=self.path_for(learning),
            title=learning.title,
            content=learning.body,
            frontmatter={
                "type": learning.type,
                "tags": learning.tags,
                "created": now,
                "auto_generated": True,
            },
            tags=learning.tags,
        )

    def generate_and_save(self, learning: Learning) -> Note:
        note = self.to_note(learning)
        self.vault.save(note)
        return note
