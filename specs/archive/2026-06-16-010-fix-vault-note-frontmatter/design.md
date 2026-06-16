# Design: Fix Vault Note Frontmatter Handling

## Overview

The fix moves frontmatter normalization into the write path of the vault. Before serializing a note, `write_note` will inspect `note.content` for an embedded YAML frontmatter block. If one exists, it extracts the agent-provided fields, removes the block from the body, and merges those fields with server-managed fields. The result is a single, valid Obsidian frontmatter block at the top of the file.

This approach is minimal and localized: the public `Note` model and tool schemas remain unchanged, and the existing `parser.extract_frontmatter` function is reused rather than duplicated.

## Proposed Directory & File Structure

```
servers/obsidian-mcp/
├── src/obsidian_mcp/
│   └── vault/
│       ├── writer.py          (Modified)
│       └── parser.py          (Unchanged, reused)
├── tests/
│   ├── test_vault.py          (Unchanged, existing tests still pass)
│   ├── test_tools.py          (Unchanged)
│   └── test_writer.py         (New — frontmatter merge regression tests)

skills/obsidian-second-brain/
└── SKILL.md                   (Modified — remove frontmatter-in-content example)

references/
└── obsidian-mcp-usage.md      (Modified — add frontmatter usage rules)

specs/changes/010-fix-vault-note-frontmatter/
├── .spec.yaml
├── proposal.md
├── specs/spec.md
├── design.md
└── tasks.md
```

## Code Architecture & Design Patterns

- **Single Responsibility:** `parser.py` owns frontmatter parsing; `writer.py` owns frontmatter serialization. The change keeps this boundary by reusing `extract_frontmatter`.
- **Defensive Merge:** Writer treats agent-provided frontmatter as untrusted input. Parse failures are logged and ignored; server-managed fields are always present.
- **Immutable Input Protection:** The implementation must not mutate the incoming `Note` object unless the caller already expects it (current `update.py` mutates before save). The recommended approach is to build a local `frontmatter` dict inside `write_note`.
- **Fail-Safe Defaults:** If extraction fails, fall back to treating content as body-only and emitting server-managed frontmatter.

## Data Model

No changes to the `Note` dataclass.

```python
@dataclass
class Note:
    path: str
    title: str
    content: str
    frontmatter: dict[str, Any] = field(default_factory=dict)
    links: list[str] = field(default_factory=list)
    backlinks: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    ctime: datetime | None = None
    mtime: datetime | None = None
```

The `note.frontmatter` field is currently populated when reading a note and by `update.py` for the `updated` timestamp. The new logic treats `note.frontmatter` as the server-managed/structured source and `content` as the agent-provided source; both are merged at write time.

## API Contracts

### Internal: `writer.write_note`

```python
def write_note(full_path: Path, note: Note) -> None:
    ...
```

Behavior contract:
- `full_path.parent` is created if missing.
- The file is written with UTF-8 encoding.
- The file begins with exactly one YAML frontmatter block when any metadata exists.
- Server-managed fields are always present: `title`, `created`, `updated`.
- `tags` is present when non-empty.
- Agent frontmatter embedded in `note.content` is extracted, removed from the body, and merged.

### Internal: `parser.extract_frontmatter`

```python
def extract_frontmatter(content: str) -> tuple[dict, str]:
    ...
```

Existing contract reused:
- Returns `(frontmatter_dict, body)`.
- If no frontmatter block is found at the start of `content`, returns `({}, content)`.
- On YAML parse error, logs a warning and returns `({}, content)`.

### Public MCP Tool: `create_note`

Schema unchanged. New documented contract:
- `title` (string, optional): displayed title and frontmatter `title`.
- `tags` (array of strings, optional): Obsidian tags written to frontmatter.
- `content` (string, optional): note body. Must not contain a leading YAML frontmatter block. If it does, the server will extract and merge it, but callers should not rely on this.

### Public MCP Tool: `update_note`

Schema unchanged. New documented contract:
- `content` replaces the body. A leading frontmatter block in replacement content will be extracted and merged with existing server-managed fields.
- `append` is appended to the body after stripping any trailing whitespace; frontmatter is not extracted from `append`.
- `tags` replaces the note's tag list.

## Flow Diagrams

### Write Note with Frontmatter in Content

1. `write_note(full_path, note)` called.
2. Build server-managed `frontmatter` dict from `note.frontmatter`, `note.title`, `note.tags`, timestamps.
3. Call `extract_frontmatter(note.content)`.
4. If extraction succeeded:
   - Update server-managed dict with extracted fields using precedence rules.
   - Use returned `body` as the new note body.
5. If extraction failed:
   - Log warning.
   - Keep original `note.content` as body.
6. Serialize merged frontmatter with `to_frontmatter`.
7. Write `frontmatter_string + body` to disk.

### Create Note from Tool

1. `handle_create_note` receives `path`, `content`, `title`, `tags`.
2. Creates `Note(path=path, title=title_or_derived, content=content, tags=tags)`.
3. `vault.save(note)` → `write_note` normalizes frontmatter.
4. Returns `{"status": "created", "path": path}`.

### Update Note from Tool

1. `handle_update_note` reads existing note via `vault.read`.
2. If `content` provided, `note.content = content`.
3. If `append` provided, append to `note.content`.
4. If `tags` provided, `note.tags = tags`.
5. `note.frontmatter["updated"] = now`.
6. `vault.save(note)` → `write_note` normalizes frontmatter if new `content` contains one.

## State Management

- No persistent state beyond the file system.
- Timestamps are generated at write time in UTC ISO-8601 format.
- `created` is preserved across saves via `setdefault`; it must never be overwritten.
- `updated` is overwritten on every save.

## Error Handling

| Scenario | Handling |
|----------|----------|
| Content has no frontmatter | Emit server-managed frontmatter only |
| Content frontmatter is valid YAML | Extract, merge, strip from body |
| Content frontmatter is invalid YAML | Log warning; treat entire content as body |
| `note.tags` is not a list | Defensive normalization in writer (current code assumes list) |
| Extracted `tags` is a string | Convert to list using comma split, matching `parse_note` behavior |
| Parent directory missing | `mkdir(parents=True, exist_ok=True)` |

## Performance Considerations

- Frontmatter extraction uses a compiled regex and `yaml.safe_load` on a small prefix of the content. Impact is negligible for typical note sizes.
- No additional file reads or index updates are introduced.

## Security Considerations

- The privacy filter runs on raw `content` before save. Frontmatter extraction happens during save, after privacy validation. No new secret exposure path is introduced.
- Existing path-traversal checks in `VaultRepository._resolve` remain in force.
- YAML loading uses `yaml.safe_load`; no arbitrary code execution risk.
