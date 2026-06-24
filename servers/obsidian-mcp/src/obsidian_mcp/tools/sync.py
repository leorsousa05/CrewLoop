import logging

from obsidian_mcp.config import Config
from obsidian_mcp.indexer.indexer import Indexer
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.indexer.sync import BundleSync
from obsidian_mcp.vault.repository import VaultRepository

logger = logging.getLogger(__name__)


def handle_sync_from_bundle(arguments: dict, config: Config) -> dict:
    force = bool(arguments.get("force", False))
    logger.info("syncing from bundle: force=%s", force)
    vault = VaultRepository(config)
    store = IndexStore(config.index_dir / "index.db")
    indexer = Indexer(config, vault, store)
    indexer.index_all(force=force)
    sync = BundleSync(config, indexer, vault)
    report = sync.sync(force=force)
    logger.info("synced from bundle: %s", report)
    return {"status": "synced", **report}
