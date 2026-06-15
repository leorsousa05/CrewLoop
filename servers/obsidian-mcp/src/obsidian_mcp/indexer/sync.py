import logging
from pathlib import Path

from obsidian_mcp.config import Config
from obsidian_mcp.indexer.indexer import Indexer
from obsidian_mcp.models import Note
from obsidian_mcp.vault.parser import parse_note
from obsidian_mcp.vault.repository import VaultRepository

logger = logging.getLogger(__name__)


class BundleSync:
    def __init__(self, config: Config, indexer: Indexer, vault: VaultRepository):
        self.config = config
        self.indexer = indexer
        self.vault = vault

    def _bundle_files(self) -> list[Path]:
        root = self.config.bundle_path
        files = []
        for pattern in ["skills/**/*.md", "references/**/*.md", "README.md", "AGENTS.md"]:
            files.extend(root.glob(pattern))
        return files

    def sync(self, force: bool = False) -> dict:
        indexed = 0
        for path in self._bundle_files():
            rel = path.relative_to(self.config.bundle_path).as_posix()
            try:
                note = parse_note(rel, path)
                self.indexer.index_note(note, force=force)
                indexed += 1
            except Exception as exc:
                logger.warning("failed to index bundle file %s: %s", rel, exc)
        self.indexer.compute_backlinks()
        return {"indexed_bundle_files": indexed}
