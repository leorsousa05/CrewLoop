import logging
from datetime import datetime, timezone

from obsidian_mcp.config import Config
from obsidian_mcp.privacy.filter import PrivacyFilter
from obsidian_mcp.vault.repository import VaultRepository

logger = logging.getLogger(__name__)


def handle_update_note(arguments: dict, config: Config) -> dict:
    path = arguments.get("path")
    if not path:
        raise ValueError("path is required")
    content = arguments.get("content")
    append = arguments.get("append")
    tags = arguments.get("tags")

    vault = VaultRepository(config)
    note = vault.read(path)

    PrivacyFilter(config).validate(content or "")
    PrivacyFilter(config).validate(append or "")

    if content is not None:
        note.content = content
    if append:
        note.content = note.content.rstrip() + "\n\n" + append
    if tags is not None:
        note.tags = tags
    note.frontmatter["updated"] = datetime.now(timezone.utc).isoformat()
    vault.save(note)
    logger.info("updated note: %s", path)
    return {"status": "updated", "path": path}
