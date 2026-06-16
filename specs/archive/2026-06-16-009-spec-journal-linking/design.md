# Design

## Journal Note Structure

`Journal/loop-engineering-agents.md` will gain a new section:

```markdown
## Specs

### Active
- [specs/changes/009-spec-journal-linking](../../specs/changes/009-spec-journal-linking/specs/spec.md)

### Archived
- [2026-06-15-001-obsidian-mcp-second-brain](../../specs/archive/2026-06-15-001-obsidian-mcp-second-brain/specs/delta.md)
...

### Decisions
- [001-mcp-architecture](../../specs/decisions/001-mcp-architecture.md)
...

### Living
- [obsidian-mcp](../../specs/living/obsidian-mcp/spec.md)
...
```

## Skill Changes

### Architect

After creating a spec in `specs/changes/NNN-name/`:

1. Invoke `obsidian-second-brain`.
2. Append a link to the new spec under `## Specs / ### Active` in `Journal/loop-engineering-agents.md`.
3. If the section does not exist, create it.

### Shipper

After moving a completed spec to `specs/archive/YYYY-MM-DD-NNN-name/`:

1. Invoke `obsidian-second-brain`.
2. Update the corresponding link in `Journal/loop-engineering-agents.md`:
   - Remove from `### Active`.
   - Add to `### Archived` with the archive path.

## Backwards Compatibility

Existing specs are linked retroactively by updating the Journal note once. Future specs are linked automatically by skill instructions.
