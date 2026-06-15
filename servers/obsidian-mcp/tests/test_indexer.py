from obsidian_mcp.indexer.embeddings import chunk_text
from obsidian_mcp.models import Note


def test_chunk_text_character_based():
    long_text = "word " * 200
    chunks = chunk_text(long_text, chunk_size=50, overlap=10)
    assert len(chunks) > 1
    assert all(len(text) <= 80 for text, _, _ in chunks)


def test_index_note(indexer, vault, store):
    note = Note(path="test.md", title="Test", content="Hello world from MCP.")
    vault.save(note)
    indexer.index_note(note)
    chunks = store.get_all_chunks()
    assert any(c.note_path == "test.md" for c in chunks)


def test_compute_backlinks(indexer, vault, store):
    vault.save(Note(path="a.md", title="A", content="Link to [[b]]."))
    vault.save(Note(path="b.md", title="B", content="Content."))
    indexer.index_note(vault.read("a.md"))
    indexer.index_note(vault.read("b.md"))
    indexer.compute_backlinks()
    edges = store.get_all_edges()
    assert any(e.source == "b.md" and e.target == "a.md" and e.relation == "backlink" for e in edges)
