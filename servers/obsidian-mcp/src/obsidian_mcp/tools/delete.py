import logging

from obsidian_mcp.config import Config
from obsidian_mcp.vault.repository import VaultRepository

logger = logging.getLogger(__name__)


def handle_delete_note(arguments: dict, config: Config) -> dict:
    path = arguments.get("path")
    if not path:
        raise ValueError("path is required")
    vault = VaultRepository(config)
    vault.delete(path)
    logger.info("deleted note: %s", path)
    return {"status": "deleted", "path": path}
