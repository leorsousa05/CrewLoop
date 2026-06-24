import os

import pytest

from obsidian_mcp.config import Config
from obsidian_mcp.indexer.indexer import Indexer
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.models import Note
from obsidian_mcp.rag.engine import RAGEngine
from obsidian_mcp.tools.registry import dispatch
from obsidian_mcp.vault.repository import VaultRepository


def test_config_bundle_path_from_env(monkeypatch, tmp_path):
    monkeypatch.setenv("CREWLOOP_BUNDLE_PATH", str(tmp_path))
    config = Config()
    assert config.bundle_path == tmp_path.resolve()


def test_vector_search_empty_vault(config, store):
    engine = RAGEngine(config, store)
    results = engine.search("anything", mode="vector")
    assert results == []


def test_text_search_empty_vault(config, store):
    engine = RAGEngine(config, store)
    results = engine.search("anything", mode="text")
    assert results == []


def test_graph_search_empty_vault(config, store):
    engine = RAGEngine(config, store)
    results = engine.search("anything", mode="graph")
    assert results == []


def test_related_notes_empty_vault(config, store):
    engine = RAGEngine(config, store)
    results = engine.related("missing.md")
    assert results == []


def test_list_notes_empty_vault(config):
    VaultRepository(config)
    result = dispatch("list_notes", {}, config)
    assert result == "No notes found."


def test_sync_from_bundle_empty_bundle(config, temp_vault):
    VaultRepository(config)
    result = dispatch("sync_from_bundle", {"force": True}, config)
    assert result["status"] == "synced"
    assert result["indexed_bundle_files"] == 0


def test_learn_from_text_no_learning(config):
    result = dispatch("learn_from_text", {"text": "Just a random sentence with no clear concept."}, config)
    assert result["status"] == "no_learning_detected"
