# Obsidian Second Brain

**Phase:** Memory & RAG

The Obsidian Second Brain skill uses a local Obsidian vault (`~/.lea`) connected via the `obsidian-mcp` server to retrieve prior knowledge and persist new concepts and decisions.

## What it does

This skill gives CrewLoop long-term memory. It can:

- Read `AGENT.md` and `MEMORY.md` for context.
- Search prior notes in `Knowledge/` and `Journal/`.
- Persist decisions, reusable patterns, and session outcomes.
- Generate dashboards and summaries.

## Vault architecture

```
~/.lea/
├── AGENT.md              # Entry point
├── MEMORY.md             # Curated memory
├── memory/               # Working memory
├── Memory/               # User profile
├── Knowledge/            # Durable technical guides
├── Journal/              # Session outcomes
├── Notes/                # Temporary drafts
└── _Inbox/               # Proposed notes
```

## When to invoke

The Obsidian Second Brain triggers on tasks involving:

- Knowledge retrieval
- Memory and RAG
- Prior decisions
- Durable knowledge
- Session summaries
- Project dashboards

## Concrete example

**Scenario:** The user asks, "What did we decide about the auth strategy?"

**Obsidian Second Brain:**

1. Reads `MEMORY.md`.
2. Searches `Knowledge/` for "auth strategy".
3. Finds `Knowledge/auth-jwt-decision.md`.
4. Answers: "We decided on JWT with httpOnly cookies. Source: `Knowledge/auth-jwt-decision.md`."

## Fallback when vault is unavailable

If the Obsidian MCP server is unavailable or `~/.lea` does not exist:

1. Stop attempting vault operations.
2. Continue the task using in-session context.
3. Briefly inform the user that vault persistence was skipped.

The vault is a performance enhancement, not a hard dependency.

## Output artifact: Notes / Updated Memory

| Layer | Use case |
|-------|----------|
| `MEMORY.md` | Curated context |
| `Knowledge/` | Durable guides and decisions |
| `Journal/` | Session outcomes |
| `Notes/` | Temporary drafts |

## Handoff

Returns to Orchestrator or the skill that invoked it.
