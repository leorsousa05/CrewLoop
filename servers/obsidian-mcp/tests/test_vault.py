import pytest

from obsidian_mcp.models import Note
from obsidian_mcp.vault.parser import parse_note
from obsidian_mcp.vault.repository import VaultRepository


def test_parse_note_with_frontmatter(temp_vault):
    path = temp_vault / "test.md"
    path.write_text("---\ntitle: Hello\ntags: [a, b]\n---\n\nBody here with [[link]].")
    note = parse_note("test.md", path)
    assert note.title == "Hello"
    assert note.frontmatter["tags"] == ["a", "b"]
    assert "Body here" in note.content
    assert note.links == ["link.md"]


def test_parse_note_without_frontmatter(temp_vault):
    path = temp_vault / "no-front.md"
    path.write_text("# My Title\n\nContent.")
    note = parse_note("no-front.md", path)
    assert note.title == "My Title"
    assert note.content == "Content."


def test_parse_note_with_invalid_frontmatter(temp_vault):
    path = temp_vault / "bad-front.md"
    path.write_text("---\ntitle: [unclosed\n---\n\nBody.")
    note = parse_note("bad-front.md", path)
    assert note.frontmatter == {}
    assert "Body." in note.content


def test_vault_crud(config):
    repo = VaultRepository(config)
    note = Note(path="foo.md", title="Foo", content="bar")
    repo.save(note)
    assert repo.exists("foo.md")
    read = repo.read("foo.md")
    assert read.title == "Foo"
    repo.delete("foo.md")
    assert not repo.exists("foo.md")


def test_vault_path_escape(config):
    repo = VaultRepository(config)
    with pytest.raises(ValueError):
        repo._resolve("../outside.md")


def test_writer_preserves_created_and_tags(config):
    repo = VaultRepository(config)
    note = Note(path="w.md", title="W", content="body", tags=["tag1"])
    repo.save(note)
    first = repo.read("w.md")
    created = first.frontmatter["created"]
    repo.save(first)
    second = repo.read("w.md")
    assert second.frontmatter["created"] == created
    assert "tag1" in second.frontmatter["tags"]


def test_vault_ignores_hidden_dirs(config):
    repo = VaultRepository(config)
    hidden = repo.root / ".hidden"
    hidden.mkdir()
    (hidden / "secret.md").write_text("# secret")
    (repo.root / "visible.md").write_text("# visible")
    notes = repo.list_notes()
    assert "visible.md" in notes
    assert "secret.md" not in notes


def test_vault_blocks_symlink_escape(config, temp_vault):
    repo = VaultRepository(config)
    outside = temp_vault.parent / "outside.md"
    outside.write_text("# outside")
    link = repo.root / "escape.md"
    link.symlink_to(outside)
    assert "escape.md" not in repo.list_notes()
    with pytest.raises(ValueError):
        repo.read("escape.md")
