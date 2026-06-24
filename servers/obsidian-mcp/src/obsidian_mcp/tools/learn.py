import logging

from obsidian_mcp.config import Config
from obsidian_mcp.indexer.indexer import Indexer
from obsidian_mcp.indexer.store import IndexStore
from obsidian_mcp.learning.detector import LearningDetector
from obsidian_mcp.learning.note_generator import NoteGenerator
from obsidian_mcp.privacy.filter import PrivacyFilter
from obsidian_mcp.vault.repository import VaultRepository

logger = logging.getLogger(__name__)


def handle_learn_from_text(arguments: dict, config: Config) -> dict:
    text = arguments.get("text", "")
    if not text:
        raise ValueError("text is required")

    PrivacyFilter(config).validate(text)

    detector = LearningDetector(config)
    learnings = detector.detect(text)
    if not learnings:
        return {"status": "no_learning_detected"}

    vault = VaultRepository(config)
    generator = NoteGenerator(config, vault)
    indexer = Indexer(config, vault, IndexStore(config.index_dir / "index.db"))

    created = []
    for learning in learnings:
        if vault.exists(generator.path_for(learning)):
            continue
        note = generator.generate_and_save(learning)
        indexer.index_note(note)
        created.append(note.path)

    if not created:
        logger.info("no new learnings created from text")
        return {"status": "duplicate", "created_notes": []}
    logger.info("learned from text, created notes: %s", created)
    return {"status": "learned", "created_notes": created}
