import tempfile
from pathlib import Path

import pytest

from obsidian_mcp.config import Config
from obsidian_mcp.indexer.indexer import Indexer
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.vault.repository import VaultRepository


@pytest.fixture
def temp_vault():
    with tempfile.TemporaryDirectory() as tmp:
        yield Path(tmp)


@pytest.fixture
def config(temp_vault):
    return Config(
        vault_path=temp_vault,
        index_dir=temp_vault / ".index",
        bundle_path=temp_vault,
    )


@pytest.fixture
def vault(config):
    return VaultRepository(config)


@pytest.fixture
def store(config):
    return IndexStore(config.index_dir / "index.db")


@pytest.fixture
def indexer(config, vault, store):
    return Indexer(config, vault, store)
