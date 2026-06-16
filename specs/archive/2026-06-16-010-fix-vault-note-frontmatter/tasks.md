# Tasks: Fix Vault Note Frontmatter Handling

## Setup
- [x] Create spec folder structure at `specs/changes/010-fix-vault-note-frontmatter/`.
- [x] Initialize `.spec.yaml` with id, name, status, created date, author, and summary.
- [x] Read affected source files (`writer.py`, `parser.py`, `create.py`, `update.py`, `models.py`, tests, skill docs).

## Implementation
- [x] Modify `servers/obsidian-mcp/src/obsidian_mcp/vault/writer.py`:
  - Import `extract_frontmatter` from `obsidian_mcp.vault.parser`.
  - At the start of `write_note`, extract frontmatter from `note.content`.
  - Merge extracted fields with server-managed fields using the precedence rules in `design.md`.
  - Replace `note.content` with the cleaned body for serialization.
  - Handle malformed frontmatter gracefully (log warning, fall back to body-only).
- [x] Normalize extracted `tags` to a list when they appear as a comma-separated string.
- [x] Ensure `created` is never overwritten on subsequent saves.
- [x] Ensure `updated` is always refreshed on every save.

## Testing
- [x] Create `servers/obsidian-mcp/tests/test_writer.py` with the following cases:
  - `test_write_note_without_frontmatter` — clean content gets server frontmatter.
  - `test_write_note_with_embedded_frontmatter` — single merged block, body stripped of frontmatter.
  - `test_write_note_with_malformed_frontmatter` — warning logged, content treated as body.
  - `test_write_note_merges_tags` — union of `note.tags` and extracted tags, sorted, no duplicates.
  - `test_write_note_preserves_created_on_update` — save twice, `created` stays constant.
  - `test_write_note_title_precedence` — `note.title` wins over embedded frontmatter title.
- [x] Run existing test suite: `cd servers/obsidian-mcp && python -m pytest`.
- [x] Fix any regressions caused by the writer change.

## Verification
- [x] Manual end-to-end check: create a note via MCP `create_note` with embedded frontmatter in `content` and verify Obsidian recognizes the tags.
- [x] Manual check: create a note with `title` and `tags` parameters only and verify clean output.
- [x] Confirm existing `test_vault.py` and `test_tools.py` still pass.

## Documentation
- [x] Update `skills/obsidian-second-brain/SKILL.md`:
  - Rewrite Dashboard Schema example to use `create_note` parameters instead of embedded frontmatter.
  - Add explicit instruction: do not include frontmatter delimiters in `content`.
- [x] Update `references/obsidian-mcp-usage.md`:
  - Add a "Frontmatter Rules" section.
  - Document server-managed fields and caller responsibilities.
  - Update examples to pass `title` and `tags` as parameters.
- [ ] If an irreversible architectural decision is made during implementation, add an ADR to `specs/decisions/`.

## Completion
- [ ] Update `specs/living/` if this change alters merged system behavior.
- [x] Move `specs/changes/010-fix-vault-note-frontmatter/` to `specs/archive/2026-06-16-010-fix-vault-note-frontmatter/` after review and merge.
- [x] Update `.spec.yaml` status to `completed`.
