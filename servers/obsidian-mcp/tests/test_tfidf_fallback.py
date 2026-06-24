from obsidian_mcp.indexer.indexer import Indexer
from obsidian_mcp.models import Chunk, Note
from obsidian_mcp.rag.engine import RAGEngine
from obsidian_mcp.rag.vector_search import TfidfIndex


def test_tfidf_index_fits_on_corpus():
    index = TfidfIndex()
    chunks = [
        Chunk(id="c1", note_path="a.md", text="MCP local second brain"),
        Chunk(id="c2", note_path="b.md", text="Another note about servers"),
    ]
    index.fit(chunks)
    results = index.query("MCP", top_k=10)
    assert any(doc_id == "c1" for doc_id, _ in results)


def test_tfidf_index_query_empty_corpus():
    index = TfidfIndex()
    index.fit([])
    assert index.query("anything") == []


def test_vector_search_builds_corpus_fitted_index(config, vault, store):
    vault.save(Note(path="a.md", title="A", content="MCP local second brain"))
    indexer = Indexer(config, vault, store)
    indexer.index_all()
    engine = RAGEngine(config, store)
    assert engine.vector_search._tfidf_index is None
    results = engine.search("MCP", mode="vector")
    assert results
    assert engine.vector_search._tfidf_index is not None
    assert engine.vector_search._tfidf_chunk_count > 0


def test_vector_search_reuses_fitted_index(config, vault, store):
    vault.save(Note(path="a.md", title="A", content="MCP local second brain"))
    indexer = Indexer(config, vault, store)
    indexer.index_all()
    engine = RAGEngine(config, store)
    engine.search("MCP", mode="vector")
    first_index = engine.vector_search._tfidf_index
    engine.search("local", mode="vector")
    assert engine.vector_search._tfidf_index is first_index


def test_vector_search_ranks_matching_note_highest(config, vault, store):
    vault.save(Note(path="a.md", title="A", content="MCP local second brain"))
    vault.save(Note(path="b.md", title="B", content="Another note about servers and embedding"))
    indexer = Indexer(config, vault, store)
    indexer.index_all()
    engine = RAGEngine(config, store)
    results = engine.search("MCP server", mode="vector")
    assert results[0].note_path == "a.md"
