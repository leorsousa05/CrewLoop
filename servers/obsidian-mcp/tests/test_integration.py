import time
from pathlib import Path

from obsidian_mcp.config import Config
from obsidian_mcp.indexer.indexer import Indexer
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.models import Note
from obsidian_mcp.tools.registry import dispatch
from obsidian_mcp.vault.repository import VaultRepository


def test_end_to_end_workflow(tmp_path):
    config = Config(
        vault_path=tmp_path / "vault",
        index_dir=tmp_path / ".index",
        bundle_path=Path(__file__).resolve().parents[3],
    )

    # 1. Sync bundle as initial knowledge
    result = dispatch("sync_from_bundle", {"force": True}, config)
    assert result["status"] == "synced"
    assert result["indexed_bundle_files"] > 0

    # 2. Search existing knowledge
    search = dispatch("search_notes", {"query": "orchestrator", "mode": "text"}, config)
    assert "orchestrator" in search.lower() or "No results" not in search

    # 3. Create a note with a link
    dispatch(
        "create_note",
        {
            "path": "projects/mcp-integration.md",
            "title": "MCP Integration",
            "content": "We integrated Obsidian via [[MCP]].",
            "tags": ["integration"],
        },
        config,
    )

    # 4. Learn from new text
    learn = dispatch(
        "learn_from_text",
        {"text": "Novo conceito: MCP Server conecta Obsidian local ao bundle LEA."},
        config,
    )
    assert learn["status"] == "learned"
    assert any("mcp-server" in p.lower() for p in learn["created_notes"])

    # 5. Re-index and find related notes
    vault = VaultRepository(config)
    indexer = Indexer(config, vault, IndexStore(config.index_dir / "index.db"))
    indexer.index_all()
    indexer.compute_backlinks()

    related = dispatch("get_related_notes", {"path": "projects/mcp-integration.md"}, config)
    assert "mcp" in related.lower()

    # 6. List notes
    listed = dispatch("list_notes", {"folder": "concepts"}, config)
    assert "mcp-server" in listed.lower()

    # 7. Read generated concept note
    concept_path = learn["created_notes"][0]
    concept = dispatch("read_note", {"path": concept_path}, config)
    assert "MCP Server" in concept


def test_search_performance(tmp_path):
    config = Config(
        vault_path=tmp_path / "vault",
        index_dir=tmp_path / ".index",
        bundle_path=tmp_path,
    )
    vault = VaultRepository(config)
    for i in range(1000):
        vault.save(
            Note(
                path=f"notes/note-{i:04d}.md",
                title=f"Note {i}",
                content=f"This is note number {i} about topic {i % 10} and keyword {i}.",
            )
        )
    indexer = Indexer(config, vault, IndexStore(config.index_dir / "index.db"))
    indexer.index_all()

    start = time.time()
    result = dispatch("search_notes", {"query": "topic 5", "mode": "text", "limit": 10}, config)
    elapsed = time.time() - start
    assert elapsed < 2.0, f"search took {elapsed:.2f}s"
    assert "note-" in result
