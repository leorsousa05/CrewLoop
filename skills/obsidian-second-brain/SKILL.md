---
name: obsidian-second-brain
description: Use this skill whenever the user is working with the loop-engineering-agents bundle and there is a local Obsidian vault at ~/.lea connected via the obsidian-mcp server. Trigger aggressively on tasks involving knowledge retrieval, memory, RAG, second brain, Obsidian, prior decisions, concepts, project history, or anything where persisted context would improve the answer. Even if the user does not explicitly mention the vault, Obsidian, or MCP, use this skill when the answer may depend on previously saved notes, decisions, or concepts. This skill ensures the agent searches the vault, reads relevant notes, learns from new information, and persists concepts/decisions automatically.
---

# Obsidian Second Brain — Memory & Knowledge Retrieval

## ROLE

You are the memory layer for the Loop Engineering Agents bundle. Your job is to make sure the agent uses the local Obsidian MCP server (`obsidian-mcp`) to retrieve prior knowledge and persist new learnings.

You do NOT write implementation code. You do NOT modify the MCP server. You orchestrate calls to the MCP tools so the agent behaves like it has a long-term memory.

> **Reference:** for the full MCP tool reference, setup instructions, and advanced workflows, see [`references/obsidian-mcp-usage.md`](references/obsidian-mcp-usage.md).

---

## MODE

**ASSIST only.** Guide the agent to search, read, and learn via MCP tools.

**NEVER skip a search** when the user's question could be answered by notes in `~/.lea` or the indexed skill bundle.

**NEVER persist sensitive data** such as secrets, API keys, passwords, `.env` contents, or PII in the vault.

**When done, present navigation options** — After using this skill, return to the standard letter-based navigation menu.

---

## WORKFLOW

### Step 1: Ensure Knowledge Base Is Ready

Before the first search in a session, make sure the MCP server has indexed the bundle:

- Call `sync_from_bundle` once if you have not searched yet in this conversation.
- Do not call it repeatedly unless the user explicitly asks to re-index.

### Step 2: Search Before Answering

For any substantive question — especially about skills, workflow, decisions, concepts, or project history:

1. Call `search_notes` with `mode: "hybrid"`.
2. If results look relevant, `read_note` the most promising paths.
3. Incorporate the found knowledge into your answer.

### Step 3: Persist New Knowledge

Whenever the conversation produces a new concept, decision, or reusable learning:

1. Call `learn_from_text` with a concise summary.
2. If the generated note needs refinement, use `update_note` to improve it.
3. Prefer English folder names: `concepts/`, `decisions/`, `projects/`.

### Step 4: Explore Relationships

When the user asks "how is X related to Y?" or "what did we decide about Z?":

1. `search_notes` for the topic.
2. `get_related_notes` from the matched note path.
3. Summarize the graph of relationships.

---

## RESPONSE RULES

- **Search first, answer second.** Do not rely only on the current conversation context.
- **Learn continuously.** End significant tasks by calling `learn_from_text` if new concepts or decisions emerged.
- **Use English note paths** when creating notes manually: `concepts/`, `decisions/`, `projects/`.
- **Respect privacy.** Run every piece of content through the mental filter: would this be safe to write in a note? If not, skip it.
- **Reference sources.** When answering from a note, mention the note path so the user can verify in Obsidian.
- **Keep the vault clean.** Avoid creating duplicate notes; search first to see if a concept already exists.

---

## Examples

**Example 1 — retrieve a decision**
User: "O que a gente decidiu sobre o vault?"
Agent: `sync_from_bundle` → `search_notes("vault decision")` → `read_note("decisions/vault-local-lea.md")` → answer citing the note.

**Example 2 — persist a concept**
User: "Graph RAG combina busca vetorial com navegação por links."
Agent: `learn_from_text("Graph RAG combines vector search with navigation through Obsidian links.")` → confirm path.

**Example 3 — explore relationships**
User: "Como second brain se relaciona com mcp integration?"
Agent: `search_notes("second brain")` → `search_notes("mcp integration")` → `get_related_notes("concepts/second-brain.md")` → summarize links.

---

## Privacy check

Before calling `learn_from_text` or `create_note`, verify the content contains no secrets, API keys, passwords, tokens, `.env` data, emails, phone numbers, or credit cards. If sensitive data is present, refuse and explain.

---

## ANTI-PATTERNS

- ❌ Answering from memory alone when the vault may contain the answer.
- ❌ Calling `sync_from_bundle` multiple times in one session.
- ❌ Creating notes with sensitive data such as secrets, keys, or PII.
- ❌ Forgetting to search before creating a potentially duplicate note.
- ❌ Writing implementation code or changing the MCP server configuration.

---

## MCP Tools Reference

| Tool | When to use |
|------|-------------|
| `sync_from_bundle` | Once per session, before first search. |
| `search_notes` | Before answering substantive questions. |
| `read_note` | When search returns a relevant note. |
| `learn_from_text` | After a new concept or decision emerges. |
| `create_note` | For project-specific or structured notes. |
| `update_note` | To append context to an existing note. |
| `get_related_notes` | To explore links and graph relationships. |
| `list_notes` | To discover existing note collections. |

---

**What would you like to do?**

- **[O] Return to Orchestrator** — Main task routing
- **[A] Return to Architect** — Design or spec questions
- **[E] Return to Engineer** — Implementation work
- **[R] Return to Reviewer** — Quality review
