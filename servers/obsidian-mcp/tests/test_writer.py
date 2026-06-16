from datetime import datetime

import pytest
import yaml

from obsidian_mcp.models import Note
from obsidian_mcp.vault.writer import write_note


def _parse_frontmatter(text: str) -> dict:
    assert text.startswith("---")
    end = text.find("\n---", 3)
    assert end != -1
    return yaml.safe_load(text[3:end])


def _get_body(text: str) -> str:
    end = text.find("\n---", 3)
    return text[end + 5 :].lstrip("\n")


def test_write_note_without_frontmatter(temp_vault):
    path = temp_vault / "clean.md"
    note = Note(path="clean.md", title="Clean Note", content="# Clean Note\n\nBody.")
    write_note(path, note)

    written = path.read_text(encoding="utf-8")
    frontmatter = _parse_frontmatter(written)
    body = _get_body(written)

    assert frontmatter["title"] == "Clean Note"
    assert "created" in frontmatter
    assert "updated" in frontmatter
    assert body == "# Clean Note\n\nBody."


def test_write_note_with_embedded_frontmatter(temp_vault):
    path = temp_vault / "embedded.md"
    content = (
        "---\n"
        "type: journal\n"
        "title: Embedded Title\n"
        "tags: [a, b]\n"
        "updated: 2026-06-16T17:35:00Z\n"
        "---\n"
        "\n"
        "# Embedded Title\n"
        "\n"
        "Body text."
    )
    note = Note(path="embedded.md", title="Server Title", content=content, tags=["c"])
    write_note(path, note)

    written = path.read_text(encoding="utf-8")
    frontmatter = _parse_frontmatter(written)
    body = _get_body(written)

    assert frontmatter["title"] == "Server Title"
    assert frontmatter["type"] == "journal"
    assert frontmatter["tags"] == ["a", "b", "c"]
    assert "created" in frontmatter
    assert "updated" in frontmatter
    assert body == "# Embedded Title\n\nBody text."


def test_write_note_with_malformed_frontmatter(temp_vault, caplog):
    path = temp_vault / "bad.md"
    content = "---\ntitle: [unclosed\n---\n\nBody."
    note = Note(path="bad.md", title="Bad Note", content=content)

    with caplog.at_level("WARNING"):
        write_note(path, note)

    written = path.read_text(encoding="utf-8")
    frontmatter = _parse_frontmatter(written)
    body = _get_body(written)

    assert "failed to parse frontmatter" in caplog.text.lower()
    assert frontmatter["title"] == "Bad Note"
    assert body == "Body."


def test_write_note_merges_tags(temp_vault):
    path = temp_vault / "tags.md"
    content = "---\ntags: [z, a, a]\n---\n\nBody."
    note = Note(path="tags.md", title="Tags Note", content=content, tags=["b", "a"])
    write_note(path, note)

    written = path.read_text(encoding="utf-8")
    frontmatter = _parse_frontmatter(written)

    assert frontmatter["tags"] == ["a", "b", "z"]


def test_write_note_preserves_created_on_update(temp_vault):
    path = temp_vault / "preserve.md"
    note = Note(path="preserve.md", title="Preserve", content="Body.")
    write_note(path, note)

    first = path.read_text(encoding="utf-8")
    first_created = _parse_frontmatter(first)["created"]

    note2 = Note(
        path="preserve.md",
        title="Preserve",
        content="Updated body.",
        frontmatter={"created": first_created},
    )
    write_note(path, note2)

    second = path.read_text(encoding="utf-8")
    second_frontmatter = _parse_frontmatter(second)

    assert second_frontmatter["created"] == first_created
    assert second_frontmatter["updated"] != first_created


def test_write_note_title_precedence(temp_vault):
    path = temp_vault / "title.md"
    content = "---\ntitle: Embedded Title\n---\n\nBody."
    note = Note(path="title.md", title="Server Title", content=content)
    write_note(path, note)

    written = path.read_text(encoding="utf-8")
    frontmatter = _parse_frontmatter(written)

    assert frontmatter["title"] == "Server Title"


def test_write_note_tags_as_string(temp_vault):
    path = temp_vault / "string-tags.md"
    content = "---\ntags: x, y, z\n---\n\nBody."
    note = Note(path="string-tags.md", title="String Tags", content=content)
    write_note(path, note)

    written = path.read_text(encoding="utf-8")
    frontmatter = _parse_frontmatter(written)

    assert frontmatter["tags"] == ["x", "y", "z"]
