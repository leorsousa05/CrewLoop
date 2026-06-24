import pytest

from obsidian_mcp.indexer.indexer import Indexer
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.models import Note
from obsidian_mcp.tools.registry import dispatch
from obsidian_mcp.vault.repository import VaultRepository


def test_tool_create_and_read(config):
    VaultRepository(config)
    result = dispatch("create_note", {"path": "t.md", "content": "Hello"}, config)
    assert result["status"] == "created"
    text = dispatch("read_note", {"path": "t.md"}, config)
    assert "Hello" in text


def test_tool_create_note_adds_extension(config):
    VaultRepository(config)
    result = dispatch("create_note", {"path": "no-extension", "content": "body"}, config)
    assert result["path"] == "no-extension.md"
    text = dispatch("read_note", {"path": "no-extension.md"}, config)
    assert "body" in text


def test_tool_create_note_title_from_path(config):
    VaultRepository(config)
    dispatch("create_note", {"path": "my-great-note.md", "content": "body"}, config)
    text = dispatch("read_note", {"path": "my-great-note.md"}, config)
    assert "My Great Note" in text


def test_tool_read_note_returns_raw_content(config, temp_vault):
    VaultRepository(config)
    dispatch(
        "create_note",
        {"path": "fm.md", "title": "FM", "content": "body", "tags": ["a", "b"]},
        config,
    )
    raw = (temp_vault / "fm.md").read_text(encoding="utf-8")
    text = dispatch("read_note", {"path": "fm.md"}, config)
    assert text == raw
    assert "body" in text
    assert "FM" in text


def test_tool_search(config):
    vault = VaultRepository(config)
    vault.save(Note(path="s.md", title="S", content="MCP server local"))
    indexer = Indexer(config, vault, IndexStore(config.index_dir / "index.db"))
    indexer.index_all()
    text = dispatch("search_notes", {"query": "MCP", "mode": "text"}, config)
    assert "s.md" in text


def test_tool_privacy_blocks(config):
    with pytest.raises(ValueError):
        dispatch("create_note", {"path": "bad.md", "content": "API_KEY=secret"}, config)


def test_tool_update_and_delete(config):
    VaultRepository(config)
    dispatch("create_note", {"path": "u.md", "content": "Original", "tags": ["a"]}, config)
    dispatch("update_note", {"path": "u.md", "append": "More", "tags": ["b"]}, config)
    text = dispatch("read_note", {"path": "u.md"}, config)
    assert "Original" in text
    assert "More" in text
    assert "b" in text
    dispatch("delete_note", {"path": "u.md"}, config)
    with pytest.raises(FileNotFoundError):
        dispatch("read_note", {"path": "u.md"}, config)


def test_tool_list_and_related(config):
    vault = VaultRepository(config)
    vault.save(Note(path="x.md", title="X", content="Link to [[y]]."))
    vault.save(Note(path="y.md", title="Y", content="Content."))
    indexer = Indexer(config, vault, IndexStore(config.index_dir / "index.db"))
    indexer.index_all()
    indexer.compute_backlinks()
    listed = dispatch("list_notes", {}, config)
    assert "x.md" in listed
    related = dispatch("get_related_notes", {"path": "x.md"}, config)
    assert "y.md" in related


def test_tool_sync_from_bundle(config, temp_vault):
    (temp_vault / "skills" / "orchestrator").mkdir(parents=True)
    (temp_vault / "skills" / "orchestrator" / "SKILL.md").write_text("# Orchestrator\n")
    (temp_vault / "README.md").write_text("# Bundle\n")
    result = dispatch("sync_from_bundle", {"force": True}, config)
    assert result["status"] == "synced"
    assert result["indexed_bundle_files"] > 0


def test_tool_path_traversal_blocked(config):
    with pytest.raises(ValueError):
        dispatch("create_note", {"path": "../outside.md", "content": "x"}, config)


def test_tool_learn_from_text(config):
    result = dispatch(
        "learn_from_text",
        {"text": "Novo conceito: Observability no projeto LEA."},
        config,
    )
    assert result["status"] == "learned"
    assert any("observability" in p.lower() for p in result["created_notes"])
