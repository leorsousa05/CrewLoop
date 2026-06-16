# Design: Cross-Skill Obsidian Second Brain Integration

## Overview

Add a small, consistent "Memory & Context" section to every skill so that each role in the Loop Engineering Agents workflow reads relevant prior context from `~/.lea` and persists new knowledge to the correct layer. The `obsidian-second-brain` skill remains the authoritative source for how to use the vault.

## Proposed Directory & File Structure

```
loop-engineering-agents/
├── references/
│   └── obsidian-mcp-usage.md     # MODIFIED: add per-skill targets
├── skills/
│   ├── orchestrator/SKILL.md     # MODIFIED: add Memory & Context section
│   ├── architect/SKILL.md        # MODIFIED: add Memory & Context section
│   ├── engineer/SKILL.md         # MODIFIED: add Memory & Context section
│   ├── reviewer/SKILL.md         # MODIFIED: add Memory & Context section
│   ├── shipper/SKILL.md          # MODIFIED: add Memory & Context section
│   ├── designer/SKILL.md         # MODIFIED: add Memory & Context section
│   ├── docs-writer/SKILL.md      # MODIFIED: add Memory & Context section
│   ├── researcher/SKILL.md       # MODIFIED: align with three-layer terms
│   ├── maintainer/SKILL.md       # MODIFIED: align with three-layer terms
│   ├── product-manager/SKILL.md  # MODIFIED: align with three-layer terms
│   └── tester/SKILL.md           # MODIFIED: align with three-layer terms
└── specs/
    ├── changes/004-cross-skill-obsidian-integration/
    │   ├── .spec.yaml
    │   ├── proposal.md
    │   ├── specs/spec.md
    │   ├── design.md
    │   └── tasks.md
    ├── decisions/003-cross-skill-obsidian-integration.md
    └── living/
        └── obsidian-second-brain/
            └── memory-architecture.md   # MODIFIED: add per-skill targets
```

## Memory & Context Section Template

Each skill receives a section like this:

```markdown
## Memory & Context

Before acting, use the `obsidian-second-brain` skill to:
1. Read `AGENT.md` once per session if not already loaded.
2. Read `MEMORY.md` at the start of each major task.
3. Search `<layer>/` for <domain-specific context>.

After significant work, persist to the correct layer:
- <outcome type> → `<layer>/`
```

## Per-Skill Targets

| Skill | Read at start | Persist at end |
|-------|---------------|----------------|
| Orchestrator | `MEMORY.md`, `Memory/preferences.md` | User priorities/context to `MEMORY.md`; unclear items to `_Inbox/` |
| Architect | `Knowledge/`, `Memory/`, `Journal/decisions*` | Specs rationale to `Knowledge/`; ADRs to `Knowledge/` |
| Designer | `Memory/preferences.md`, `Journal/design*`, `Knowledge/brand*` | Design direction to `Journal/`; reusable systems to `Knowledge/` |
| Engineer | `Knowledge/`, `Journal/`, `Memory/` | Implementation notes to `Journal/`; reusable patterns to `Knowledge/` |
| Reviewer | `Knowledge/conventions*`, `Journal/decisions*`, `Memory/` | Review findings to `Journal/`; process updates to `Knowledge/` |
| Shipper | `Knowledge/conventions*`, `Memory/preferences.md` | Shipping log to `Journal/` |
| Docs-Writer | `Knowledge/`, `Memory/preferences.md`, `Journal/` | New/updated docs to `Knowledge/` |
| Researcher | `Knowledge/`, `Journal/` | Research summaries to `Knowledge/` or `_Inbox/` |
| Maintainer | `Knowledge/`, `Journal/incidents*` | Incident/debt notes to `Journal/`; runbooks to `Knowledge/` |
| Product-Manager | `Memory/preferences.md`, `Journal/`, `Knowledge/` | Decisions/metrics to `Knowledge/` or `Journal/` |
| Tester | `Knowledge/`, `Journal/bugs*` | Test strategies/heuristics to `Knowledge/` |

## Architecture & Patterns

- **Cross-cutting concern:** Memory integration is added as a non-intrusive section in each skill.
- **Single source of truth:** `obsidian-second-brain/SKILL.md` and `references/obsidian-mcp-usage.md` define how to use the vault.
- **Convention over duplication:** Each skill uses the same section title and a short checklist, with only domain-specific paths changing.

## State Management

- No runtime state. The vault at `~/.lea` is the shared state.
- Each skill is responsible for reading relevant layers and writing outcomes back.

## Error Handling

- If `AGENT.md` or `MEMORY.md` is missing, the agent should create defaults per `obsidian-second-brain` rules.
- If a search returns no results, proceed with user context; do not block.

## Performance Considerations

- `MEMORY.md` read is cheap (~500 words).
- Searches should be targeted to one or two layers per skill to avoid token bloat.
- Avoid reading the full vault in any skill.

## Security Considerations

- Same privacy rules as `obsidian-second-brain`: no secrets, API keys, tokens, passwords, or PII in any layer.
- Each skill must run a privacy check before persisting.
