from obsidian_mcp.learning.detector import LearningDetector
from obsidian_mcp.learning.note_generator import NoteGenerator
from obsidian_mcp.tools.registry import dispatch
from obsidian_mcp.vault.repository import VaultRepository


def test_detect_concept(config, vault):
    detector = LearningDetector(config)
    learnings = detector.detect("Novo conceito: Graph RAG será usado no projeto.")
    assert any(l.type == "concept" and "Graph RAG" in l.title for l in learnings)


def test_detect_decision(config, vault):
    detector = LearningDetector(config)
    learnings = detector.detect("Decidimos que o vault ficará em ~/.lea.")
    assert any(l.type == "decision" for l in learnings)


def test_note_generator(config, vault):
    detector = LearningDetector(config)
    learnings = detector.detect("Novo conceito: MCP Server.")
    gen = NoteGenerator(config, vault)
    note = gen.to_note(learnings[0])
    assert note.path.startswith("concepts/")
    assert note.frontmatter["auto_generated"] is True


def test_learn_from_text_dedup(config):
    VaultRepository(config)
    text = "Novo conceito: Dedup Test no projeto."
    first = dispatch("learn_from_text", {"text": text}, config)
    assert first["status"] == "learned"
    second = dispatch("learn_from_text", {"text": text}, config)
    assert second["status"] == "duplicate"
