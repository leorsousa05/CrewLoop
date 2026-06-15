import logging
import re
from datetime import datetime, timezone
from pathlib import Path

import yaml

from obsidian_mcp.models import Note

logger = logging.getLogger(__name__)


FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
LINK_RE = re.compile(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]")


def extract_frontmatter(content: str) -> tuple[dict, str]:
    match = FRONTMATTER_RE.match(content)
    if not match:
        return {}, content
    try:
        frontmatter = yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError as exc:
        logger.warning("failed to parse frontmatter: %s", exc)
        frontmatter = {}
    body = content[match.end():]
    return frontmatter, body


def extract_title_and_body(body: str) -> tuple[str, str]:
    lines = body.splitlines()
    if lines and lines[0].startswith("# "):
        title = lines[0][2:].strip()
        return title, "\n".join(lines[1:]).lstrip("\n")
    return "", body


def extract_title(body: str, path: str) -> str:
    title, _ = extract_title_and_body(body)
    if title:
        return title
    return Path(path).stem.replace("-", " ").replace("_", " ").title()


def normalize_link(link: str) -> str:
    link = link.strip()
    if not any(link.endswith(ext) for ext in (".md", ".png", ".jpg", ".jpeg", ".pdf")):
        link += ".md"
    return link


def extract_links(content: str) -> list[str]:
    return [normalize_link(m.group(1)) for m in LINK_RE.finditer(content)]


def parse_note(path: str, full_path: Path) -> Note:
    content = full_path.read_text(encoding="utf-8")
    frontmatter, body = extract_frontmatter(content)
    if frontmatter.get("title"):
        title = frontmatter["title"]
    else:
        title, body = extract_title_and_body(body)
        if not title:
            title = extract_title(body, path)
    links = extract_links(content)
    stat = full_path.stat()
    ctime = datetime.fromtimestamp(stat.st_ctime, tz=timezone.utc)
    mtime = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc)
    tags = frontmatter.get("tags", []) or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]
    return Note(
        path=path,
        title=title,
        content=body,
        frontmatter=frontmatter,
        links=links,
        backlinks=[],
        tags=tags,
        ctime=ctime,
        mtime=mtime,
    )
