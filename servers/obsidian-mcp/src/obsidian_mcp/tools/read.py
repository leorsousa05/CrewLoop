import logging

from obsidian_mcp.config import Config
from obsidian_mcp.vault.repository import VaultRepository

logger = logging.getLogger(__name__)


def handle_read_note(arguments: dict, config: Config) -> str:
    path = arguments.get("path")
    if not path:
        raise ValueError("path is required")
    vault = VaultRepository(config)
    logger.debug("reading note: %s", path)
    return vault.read_raw(path)
