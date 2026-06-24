import pytest

from obsidian_mcp.tools.registry import dispatch
from obsidian_mcp.vault.repository import VaultRepository


def test_read_note_returns_exact_file_content(config, temp_vault):
    VaultRepository(config)
    raw = "---\ntitle: Exact Note\ntags:\n  - alpha\n  - beta\n---\n\n# Exact Note\n\nKeep the frontmatter exactly as written."
    (temp_vault / "exact.md").write_text(raw, encoding="utf-8")
    result = dispatch("read_note", {"path": "exact.md"}, config)
    assert result == raw


def test_read_note_does_not_inject_title_or_tags(config, temp_vault):
    VaultRepository(config)
    raw = "Plain body without title or tags."
    (temp_vault / "plain.md").write_text(raw, encoding="utf-8")
    result = dispatch("read_note", {"path": "plain.md"}, config)
    assert result == raw
    assert "# " not in result
    assert "**Tags:**" not in result


def test_read_note_non_utf8_replacement(config, vault, temp_vault):
    VaultRepository(config)
    path = temp_vault / "binary.md"
    path.write_bytes(b"\xff\xfeHello\xfa world")
    result = dispatch("read_note", {"path": "binary.md"}, config)
    assert "Hello" in result
    assert "world" in result


def test_read_note_missing_raises(config):
    VaultRepository(config)
    with pytest.raises(FileNotFoundError):
        dispatch("read_note", {"path": "missing.md"}, config)
