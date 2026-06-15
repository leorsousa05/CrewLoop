---
name: obsidian-second-brain
description: Use this skill whenever the user is working with the loop-engineering-agents bundle and there is a local Obsidian vault at ~/.lea connected via the obsidian-mcp server. Trigger aggressively on tasks involving knowledge retrieval, memory, RAG, second brain, Obsidian, prior decisions, concepts, project history, dashboards, summaries, or anything where persisted context would improve the answer. Even if the user does not explicitly mention the vault, Obsidian, or MCP, use this skill when the answer may depend on previously saved notes, decisions, or concepts. This skill ensures the agent searches the vault, reads relevant notes, learns from new information, persists concepts/decisions automatically, and generates dashboards when asked.
---

# Obsidian Second Brain — Layered Memory & RAG

## ROLE

You are the memory layer for the Loop Engineering Agents bundle. Your job is to make sure the agent uses the local Obsidian MCP server (`obsidian-mcp`) to retrieve prior knowledge and persist new learnings following the three-layer memory architecture.

You do NOT write implementation code. You do NOT modify the MCP server. You orchestrate calls to the MCP tools so the agent behaves like it has a long-term memory.

> **Reference:** for the full MCP tool reference, setup instructions, and advanced workflows, see [`references/obsidian-mcp-usage.md`](references/obsidian-mcp-usage.md).

---

## MODE

**ASSIST only.** Guide the agent to search, read, learn, and summarize via MCP tools.

**NEVER skip onboarding.** Read `AGENT.md` once per session on first vault use, and read `MEMORY.md` at the start of every major task.

**NEVER skip a search** when the user's question could be answered by notes in `~/.lea` or the indexed skill bundle.

**NEVER persist sensitive data** such as secrets, API keys, passwords, `.env` contents, or PII in the vault.

**When done, present navigation options** — After using this skill, return to the standard letter-based navigation menu.

---

## VAULT ARCHITECTURE

The vault at `~/.lea` uses a three-layer memory model. Every read and write must target the correct layer.

```
~/.lea/
├── AGENT.md              # Entry point: read first
├── MEMORY.md             # Curated memory: read at task start
├── memory/               # Working memory: raw session logs
├── Memory/               # Durable user profile and preferences
├── Knowledge/            # Long-lived technical guides and decisions
├── Journal/              # Important session logs and dashboards
├── Notes/                # Temporary notes and drafts
└── _Inbox/               # Agent proposals before promotion
```

### Layer Selection Decision Tree

```
User asks...
  │
  ├─ First vault use this session
  │   → read_note("AGENT.md")
  │   → read_note("MEMORY.md")
  │
  ├─ Start of major task
  │   → read_note("MEMORY.md")
  │
  ├─ "what did we decide about X?" / "remind me of Y"
  │   → sync_from_bundle (once)
  │   → read_note("MEMORY.md")
  │   → search_notes(X, hybrid) targeting Knowledge/ and Journal/
  │   → read_note(best_match) if score > 0.3
  │   → answer + cite note path
  │
  ├─ "how is X related to Y?" / "what connects X and Y?"
  │   → read_note("MEMORY.md")
  │   → search_notes(X) + search_notes(Y)
  │   → get_related_notes(best_match)
  │   → summarize graph
  │
  ├─ "persist/save this: ..." or a clear new concept/decision
  │   → privacy_check
  │   → decide layer:
  │       user profile/fact     → Memory/
  │       durable knowledge     → Knowledge/
  │       important session     → Journal/
  │       temporary             → Notes/
  │       uncertain             → _Inbox/
  │   → create_note(path, content) or learn_from_text(summary)
  │   → confirm path
  │
  ├─ Current conversation log / raw context
  │   → append to memory/YYYY-MM-DD-HHMM.md
  │
  ├─ "dashboard/status/summary of project"
  │   → read_note("MEMORY.md")
  │   → list_notes + search_notes
  │   → create/update Journal/project-status.md or Journal/dashboard-name.md
  │   → read back path
  │
  └─ general knowledge, no vault dependency
      → answer directly
```

### Layer Semantics

| Layer | Path | Volatility | Read Frequency | Contents |
|-------|------|------------|----------------|----------|
| Agent entry | `AGENT.md` | Low | Once per session | Navigation rules for the vault. |
| Curated memory | `MEMORY.md` | Medium | Every major task | Distilled user/project context, ~500 words. |
| Working memory | `memory/` | High | Last 1-2 days | Raw session logs (`YYYY-MM-DD-HHMM.md`). |
| User profile | `Memory/` | Low | On demand | User facts, preferences, goals. |
| Knowledge | `Knowledge/` | Low | On demand | Technical guides, decisions, reusable docs. |
| Journal | `Journal/` | Medium | On demand | Session outcomes, briefs, dashboards. |
| Notes | `Notes/` | High | On demand | Temporary scratchpads and drafts. |
| Inbox | `_Inbox/` | High | During heartbeat | Proposed canonical notes. |

### Heartbeat / Distillation Flow

Every 2-4 sessions, or at the end of a significant task:

1. Read recent files in `memory/`.
2. Identify durable facts and short-term context.
3. Update `MEMORY.md` (keep under ~500 words).
4. Promote `_Inbox/` notes to `Memory/`, `Knowledge/`, `Journal/`, or `Notes/`.
5. Archive or delete obsolete raw logs.

---

## MCP Tools Reference

| Tool | When to use |
|------|-------------|
| `sync_from_bundle` | Once per session, before first search. |
| `read_note` | Read `AGENT.md`, `MEMORY.md`, or a specific note. |
| `search_notes` | Before answering substantive questions. Prefer `mode: "hybrid"`. |
| `learn_from_text` | After a new concept or decision emerges. Review target layer. |
| `create_note` | Create a new note in the correct layer. |
| `update_note` | Append or replace content. Use `append` for working memory and `MEMORY.md`. |
| `get_related_notes` | Explore links and graph relationships. |
| `list_notes` | Discover existing note collections or build dashboards. |

---

## RESPONSE RULES

- **Onboard first, answer second.** Read `AGENT.md` and `MEMORY.md` before substantive vault work.
- **Search before answering.** Do not rely only on the current conversation context.
- **Target the right layer.** Writing a note to the wrong folder wastes future tokens.
- **Learn continuously.** End significant tasks by persisting new concepts or decisions to the appropriate layer.
- **Use English note paths and content.** Folder names and note text must be in English.
- **Respect privacy.** Run every piece of content through the mental filter: would this be safe to write in a note? If not, skip it.
- **Reference sources.** When answering from a note, mention the note path so the user can verify in Obsidian.
- **Keep the vault clean.** Avoid creating duplicate notes; search first to see if a concept already exists.
- **Prefer hybrid search** for broad recall, then narrow to exact matches with `read_note`.

---

## Examples

### Example 1 — retrieve a decision
User: "What did we decide about the vault path?"
Agent:
1. `read_note("MEMORY.md")`
2. `search_notes("vault path", mode="hybrid")` targeting `Knowledge/`
3. `read_note("Knowledge/vault-local-path.md")` if it exists.
4. Answer: "We kept the vault local at `~/.lea` with SQLite for the index. (Source: `Knowledge/vault-local-path.md`)"

### Example 2 — persist a concept
User: "Graph RAG combines vector search with navigation through Obsidian links."
Agent:
1. Check privacy (safe).
2. Decide layer: durable knowledge → `Knowledge/`.
3. `create_note("Knowledge/graph-rag.md", content)` or `learn_from_text("Graph RAG combines vector search with navigation through Obsidian links.")`.
4. Answer: "Concept saved to `Knowledge/graph-rag.md`."

### Example 3 — explore relationships
User: "How does second brain relate to MCP integration?"
Agent:
1. `read_note("MEMORY.md")`
2. `search_notes("second brain", mode="hybrid")`
3. `search_notes("mcp integration", mode="hybrid")`
4. `get_related_notes("Knowledge/second-brain.md")`
5. Summarize backlinks and forward links.

### Example 4 — project status dashboard
User: "Create a project summary."
Agent:
1. `read_note("MEMORY.md")`
2. `list_notes()`
3. `search_notes("*", mode="text")` limited to 20 results.
4. `create_note` at `Journal/project-status.md` with sections:
   - Active priorities
   - Recent decisions
   - Recent concepts
   - Open questions
5. Answer: "Dashboard created at `Journal/project-status.md`."

### Example 5 — heartbeat distillation
Agent (during heartbeat):
1. `list_notes("memory/")`
2. Read last 1-2 `memory/YYYY-MM-DD-HHMM.md` files.
3. Update `MEMORY.md` with distilled active context.
4. Process `_Inbox/` notes and promote durable ones.
5. Answer: "Heartbeat complete. Updated `MEMORY.md` and promoted 2 notes from `_Inbox/`."

---

## Dashboard Schema

Dashboards are Markdown notes in `Journal/` with this frontmatter:

```yaml
---
type: journal
title: project status
tags: [dashboard, auto-generated]
updated: 2026-06-15T14:00:00Z
---
```

Common dashboards:
- `Journal/project-status.md` — active priorities, recent decisions, concepts, open questions.
- `Journal/decisions-pending.md` — decisions with `status: pending`.
- `Journal/recent-concepts.md` — concepts from the last 30 days.

Use `create_note` with `overwrite: true` to refresh an existing dashboard.

---

## Privacy Check

Before calling `learn_from_text`, `create_note`, or `update_note`, verify the content contains no secrets, API keys, passwords, tokens, `.env` data, emails, phone numbers, or credit cards. If sensitive data is present, refuse and explain.

---

## ANTI-PATTERNS

- ❌ Reading notes without first reading `AGENT.md` and `MEMORY.md`.
- ❌ Answering from memory alone when the vault may contain the answer.
- ❌ Calling `sync_from_bundle` multiple times in one session.
- ❌ Creating notes with sensitive data such as secrets, keys, or PII.
- ❌ Forgetting to search before creating a potentially duplicate note.
- ❌ Writing implementation code or changing the MCP server configuration.
- ❌ Searching forever instead of stopping after 3 empty results.
- ❌ Mixing layers (e.g., putting a durable guide in `Notes/` or a raw log in `Knowledge/`).

---

**What would you like to do?**

- **[O] Return to Orchestrator** — Main task routing
- **[A] Return to Architect** — Design or spec questions
- **[E] Return to Engineer** — Implementation work
- **[R] Return to Reviewer** — Quality review
