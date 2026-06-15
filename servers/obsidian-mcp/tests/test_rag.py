from obsidian_mcp.indexer.indexer import Indexer
from obsidian_mcp.models import Note
from obsidian_mcp.rag.engine import RAGEngine


def test_text_search(indexer, vault, config, store):
    note = Note(path="search.md", title="Search", content="Obsidian vault local second brain.")
    vault.save(note)
    indexer.index_note(note)
    engine = RAGEngine(config, store)
    results = engine.search("Obsidian", mode="text")
    assert any(r.note_path == "search.md" for r in results)


def test_related_notes(indexer, vault, config, store):
    vault.save(Note(path="a.md", title="A", content="See [[b]]."))
    vault.save(Note(path="b.md", title="B", content="Content."))
    indexer.index_note(vault.read("a.md"))
    indexer.index_note(vault.read("b.md"))
    indexer.compute_backlinks()
    engine = RAGEngine(config, store)
    results = engine.related("a.md")
    assert any(r.note_path == "b.md" for r in results)


def test_graph_search(indexer, vault, config, store):
    vault.save(Note(path="a.md", title="A", content="See [[b]]."))
    vault.save(Note(path="b.md", title="B", content="Content."))
    indexer.index_note(vault.read("a.md"))
    indexer.index_note(vault.read("b.md"))
    indexer.compute_backlinks()
    engine = RAGEngine(config, store)
    results = engine.search("b", mode="graph")
    assert any(r.note_path == "b.md" for r in results)


def test_vector_search_fallback(config, vault, store):
    vault.save(Note(path="v.md", title="V", content="MCP local second brain"))
    indexer = Indexer(config, vault, store)
    indexer.index_all()
    engine = RAGEngine(config, store)
    results = engine.search("MCP", mode="vector")
    assert any(r.note_path == "v.md" for r in results)


def test_vector_search_fallback_ranks_matching_note(config, vault, store):
    vault.save(Note(path="a.md", title="A", content="MCP local second brain"))
    vault.save(Note(path="b.md", title="B", content="Another note about servers and embedding"))
    indexer = Indexer(config, vault, store)
    indexer.index_all()
    engine = RAGEngine(config, store)
    results = engine.search("MCP server", mode="vector")
    assert results[0].note_path == "a.md"


def test_hybrid_search_normalizes_scores(config, vault, store):
    vault.save(Note(path="a.md", title="A", content="MCP local second brain"))
    vault.save(Note(path="b.md", title="B", content="Another note about servers and embedding"))
    indexer = Indexer(config, vault, store)
    indexer.index_all()
    engine = RAGEngine(config, store)
    results = engine.search("MCP", mode="hybrid")
    assert results
    assert all(0.0 <= r.score <= 1.0 for r in results)
