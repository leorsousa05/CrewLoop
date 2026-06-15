from datetime import datetime, timezone
from pathlib import Path

import yaml

from obsidian_mcp.models import Note


def to_frontmatter(data: dict) -> str:
    if not data:
        return ""
    return "---\n" + yaml.safe_dump(data, sort_keys=False, allow_unicode=True) + "---\n\n"


def write_note(full_path: Path, note: Note) -> None:
    full_path.parent.mkdir(parents=True, exist_ok=True)
    frontmatter = dict(note.frontmatter)
    frontmatter.setdefault("title", note.title)
    if note.tags:
        existing = set(frontmatter.get("tags", []))
        existing.update(note.tags)
        frontmatter["tags"] = sorted(existing)
    now = datetime.now(timezone.utc).isoformat()
    frontmatter.setdefault("created", now)
    frontmatter["updated"] = now
    content = to_frontmatter(frontmatter) + note.content
    full_path.write_text(content, encoding="utf-8")
