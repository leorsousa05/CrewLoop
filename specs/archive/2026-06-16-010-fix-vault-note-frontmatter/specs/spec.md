# Spec Delta: Vault Note Frontmatter

## Current State

### Server write path

`servers/obsidian-mcp/src/obsidian_mcp/vault/writer.py` unconditionally prepends a new YAML frontmatter block to `note.content`:

```python
def write_note(full_path: Path, note: Note) -> None:
    full_path.parent.mkdir(parents=True, exist_ok=True)
    frontmatter = dict(note.frontmatter)
    frontmatter.setdefault("title", note.title)
    if note.tags:
        existing = set(frontmatter.get("tags", []))
        existing.update(note.tags)
        frontmatter["tags"] = sorted(existing)
    now = datetime.now(timezone.utc).isoformat()
    frontmatter.setdefault("created", now)
    frontmatter["updated"] = now
    content = to_frontmatter(frontmatter) + note.content
    full_path.write_text(content, encoding="utf-8")
```

`to_frontmatter` always emits:

```yaml
---
title: ...
tags: [...]
created: ...
updated: ...
---

```

### Tool create path

`servers/obsidian-mcp/src/obsidian_mcp/tools/create.py` builds a `Note` from the `create_note` arguments. The `content` argument is passed verbatim into `Note.content`. If the agent embeds a YAML block inside `content`, that block is treated as body text and a second frontmatter block is prepended by `write_note`.

### Tool update path

`servers/obsidian-mcp/src/obsidian_mcp/tools/update.py` reads an existing note, mutates `note.content`, `note.tags`, and `note.frontmatter["updated"]`, then saves. It does not detect embedded frontmatter in replacement content either.

### Parser

`servers/obsidian-mcp/src/obsidian_mcp/vault/parser.py` already provides `extract_frontmatter(content: str) -> tuple[dict, str]`. It uses a regex matching `^---\s*\n(.*?)\n---\s*\n` and parses the captured YAML. It returns the extracted frontmatter dict and the remaining body. This function is currently used only when reading notes, not when writing them.

### Documentation

- `skills/obsidian-second-brain/SKILL.md` contains a Dashboard Schema example that shows a full frontmatter block and implies it belongs inside the note `content`.
- `references/obsidian-mcp-usage.md` does not explicitly forbid embedding frontmatter in `content`.

### Tests

`servers/obsidian-mcp/tests/test_vault.py` covers parsing, CRUD, created preservation, and hidden-dir/symlink security. `servers/obsidian-mcp/tests/test_tools.py` covers `create_note`, `update_note`, and frontmatter rendering. Neither file tests the double-frontmatter scenario.

## Changes

### ADDED
- Frontmatter detection step at the start of `write_note`.
- Merge helper or inline logic that combines extracted agent frontmatter with server-managed fields.
- Regression tests in `servers/obsidian-mcp/tests/test_writer.py` (or `test_vault.py` if preferred by engineer) for:
  - content without frontmatter,
  - content with valid frontmatter,
  - content with malformed/unparseable frontmatter,
  - merging of `title`, `tags`, `created`, and `updated`,
  - idempotent save preserves `created` and merges tags.

### MODIFIED
- `servers/obsidian-mcp/src/obsidian_mcp/vault/writer.py`
  - Detect if `note.content` starts with YAML frontmatter using `parser.extract_frontmatter`.
  - If frontmatter is found, separate body from embedded frontmatter.
  - Merge server-managed fields with extracted fields:
    - `title`: server `note.title` wins unless empty.
    - `tags`: union of extracted tags and `note.tags`, normalized and sorted.
    - `created`: keep existing value if present; otherwise set to now.
    - `updated`: always set to now.
    - All other extracted fields preserved verbatim.
  - Write a single frontmatter block followed by the clean body.
- `skills/obsidian-second-brain/SKILL.md`
  - Remove or rewrite the Dashboard Schema example so it does not show frontmatter inside `content`.
  - Add explicit instruction: pass `title` and `tags` as `create_note` parameters; do not include `---` frontmatter delimiters in `content`.
- `references/obsidian-mcp-usage.md`
  - Add a "Frontmatter Rules" section explaining server-managed fields and the anti-pattern of embedding frontmatter in `content`.
  - Update examples to use `title` and `tags` parameters.

### REMOVED
- Nothing.

## Migration Notes

- Existing corrupted notes in `~/.lea` are not automatically repaired. They must be cleaned up manually or by re-saving through the updated tool path after reading and re-creating.
- Agent consumers should stop prepending frontmatter to `content`. The server now tolerates it but normalizes it; relying on this tolerance is discouraged.

## Backward Compatibility

- Non-breaking for well-behaved callers that already pass `title` and `tags` as parameters.
- Non-breaking for existing single-frontmatter notes when read by `parse_note`.
- Breaking for workflows that intentionally relied on raw frontmatter being preserved as body text. This is considered a bug, not a feature, and is the target behavior change.
