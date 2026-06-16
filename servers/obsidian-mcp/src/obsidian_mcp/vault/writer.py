import logging
from datetime import datetime, timezone
from pathlib import Path

import yaml

from obsidian_mcp.models import Note
from obsidian_mcp.vault.parser import extract_frontmatter

logger = logging.getLogger(__name__)


def to_frontmatter(data: dict) -> str:
    if not data:
        return ""
    return "---\n" + yaml.safe_dump(data, sort_keys=False, allow_unicode=True) + "---\n\n"


def _normalize_tags(tags) -> list[str]:
    if tags is None:
        return []
    if isinstance(tags, str):
        return [t.strip() for t in tags.split(",") if t.strip()]
    return list(tags)


def write_note(full_path: Path, note: Note) -> None:
    full_path.parent.mkdir(parents=True, exist_ok=True)

    body = note.content
    extracted_frontmatter = {}
    if note.content.startswith("---"):
        extracted_frontmatter, body = extract_frontmatter(note.content)
        if extracted_frontmatter is None:
            logger.warning("failed to parse embedded frontmatter in %s", full_path)
            extracted_frontmatter = {}
            body = note.content

    frontmatter = dict(note.frontmatter)
    frontmatter.setdefault("title", note.title)

    server_tags = _normalize_tags(note.tags)
    extracted_tags = _normalize_tags(extracted_frontmatter.pop("tags", []))
    all_tags = set(server_tags)
    all_tags.update(extracted_tags)
    all_tags.update(_normalize_tags(frontmatter.get("tags", [])))
    if all_tags:
        frontmatter["tags"] = sorted(all_tags)
    elif "tags" in frontmatter:
        del frontmatter["tags"]

    for key, value in extracted_frontmatter.items():
        if key not in ("title", "created", "updated"):
            frontmatter.setdefault(key, value)

    now = datetime.now(timezone.utc).isoformat()
    frontmatter.setdefault("created", now)
    frontmatter["updated"] = now

    content = to_frontmatter(frontmatter) + body
    full_path.write_text(content, encoding="utf-8")
