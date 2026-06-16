# Proposal: Fix Vault Note Frontmatter Handling

## Status
- **State:** active
- **Created:** 2026-06-16
- **Author:** @architect

## Problem Statement

Notes created by agents in the Obsidian vault `~/.lea` have YAML frontmatter `tags`, but Obsidian does not recognize them. The root cause is a frontmatter collision between the Obsidian MCP server and the `obsidian-second-brain` skill.

The MCP server (`servers/obsidian-mcp/src/obsidian_mcp/vault/writer.py`) automatically prepends a YAML frontmatter block containing `title`, `tags`, `created`, and `updated` every time it saves a note. At the same time, the `obsidian-second-brain` skill instructs agents to include a full frontmatter YAML block inside the `content` parameter of `create_note` (see its Dashboard Schema example). When both frontmatter blocks are present, the resulting file has two separate YAML blocks, with the first one malformed because it lacks the opening `---`. Obsidian parses the first malformed block and ignores the second block that contains the actual tags.

Example corrupted note (`Journal/2026-06-16-seo-template-design-specs.md`):

```markdown
# 2026 06 16 Seo Template Design Specs
title: 2026 06 16 Seo Template Design Specs
created: 2026-06-16T17:33:49.509724+00:00
updated: 2026-06-16T17:33:49.509724+00:00

---
type: journal
title: SEO Template PHP — Design Specs Completed
tags: [seo-template-php, designer, ui-ux]
updated: 2026-06-16T17:35:00Z
---

# SEO Template PHP — Design Specs Completed
...
```

This breaks tag-based retrieval, graph navigation, dashboards, and user trust in the vault.

## Goals

1. Ensure every note saved by the MCP server contains exactly one valid YAML frontmatter block.
2. Preserve agent-provided frontmatter fields when `content` already starts with frontmatter.
3. Merge server-managed fields (`title`, `tags`, `created`, `updated`) with agent-provided frontmatter without data loss.
4. Update skill and reference documentation so agents pass `title` and `tags` as `create_note` parameters and do not embed frontmatter in `content`.
5. Add regression tests covering frontmatter detection, extraction, merging, and round-trip behavior.

## Non-Goals

- Changing the Obsidian vault path (`~/.lea`) or the three-layer memory architecture.
- Modifying how tags are indexed or searched.
- Altering the privacy filter behavior.
- Supporting non-YAML frontmatter formats.
- Changing the public tool schemas beyond clarifying usage in documentation.

## Constraints

- The server must remain compatible with existing notes that have a single valid frontmatter block.
- Existing notes with malformed/double frontmatter should not be auto-repaired by this change (scope is write-time prevention).
- The fix must work with the current `yaml.safe_load` / `yaml.safe_dump` stack.
- Changes must pass the existing pytest suite and new regression tests.
- Skill documentation changes must not contradict the global conventions in `references/conventions.md`.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Frontmatter merge logic drops agent-provided fields | High | Define explicit precedence rules and unit-test every merge branch |
| Tag merging duplicates or loses tags | Medium | Normalize tags to a set, sort the result, and test mixed string/list tag sources |
| Existing vault notes remain corrupted | Medium | Document manual cleanup; the fix prevents new corruption only |
| Agents continue embedding frontmatter in `content` | Medium | Update both `SKILL.md` and `references/obsidian-mcp-usage.md` with clear anti-pattern examples |
| YAML parsing of agent frontmatter fails | Low | Log a warning and fall back to server-managed frontmatter only |

## Success Criteria

- [ ] A note created with `create_note(path=..., title=..., tags=..., content="# Body")` produces exactly one valid frontmatter block.
- [ ] A note created with `create_note(path=..., content="---\ntitle: X\ntags: [a]\n---\n\n# Body")` produces exactly one valid frontmatter block containing merged `title`, `tags`, `created`, and `updated`.
- [ ] Obsidian recognizes tags in newly created notes.
- [ ] Existing tests in `servers/obsidian-mcp/tests/` continue to pass.
- [ ] New regression tests cover at least: clean content, content with frontmatter, content with malformed frontmatter, tag merging, and idempotent saves.
- [ ] `skills/obsidian-second-brain/SKILL.md` and `references/obsidian-mcp-usage.md` no longer instruct agents to put frontmatter inside `content`.
