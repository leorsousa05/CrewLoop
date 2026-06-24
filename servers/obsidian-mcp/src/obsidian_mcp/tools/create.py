import logging
from pathlib import Path

from obsidian_mcp.config import Config
from obsidian_mcp.models import Note
from obsidian_mcp.privacy.filter import PrivacyFilter
from obsidian_mcp.vault.repository import VaultRepository

logger = logging.getLogger(__name__)


def handle_create_note(arguments: dict, config: Config) -> dict:
    path = arguments.get("path")
    content = arguments.get("content", "")
    title = arguments.get("title")
    tags = arguments.get("tags", [])
    overwrite = bool(arguments.get("overwrite", False))
    if not path:
        raise ValueError("path is required")

    if not path.endswith(".md"):
        path = path + ".md"

    PrivacyFilter(config).validate(path)
    PrivacyFilter(config).validate(content)

    vault = VaultRepository(config)
    if vault.exists(path) and not overwrite:
        raise FileExistsError(f"note already exists: {path}")

    note = Note(
        path=path,
        title=title or _title_from_path(path),
        content=content,
        tags=tags,
    )
    vault.save(note)
    logger.info("created note: %s", path)
    return {"status": "created", "path": path}


def _title_from_path(path: str) -> str:
    return Path(path).stem.replace("-", " ").replace("_", " ").title()
