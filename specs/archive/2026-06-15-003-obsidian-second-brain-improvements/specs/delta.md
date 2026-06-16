## Requirements

### Functional Requirements

1. **Workflow rules**
   - The skill must define a decision tree:
     - If the user asks about **existing knowledge** → `search_notes` → `read_note` → answer.
     - If the user asks about **relationships or gaps** → `search_notes` → `get_related_notes` → answer.
     - If the user shares a **new concept or decision** → `learn_from_text`.
     - If the user asks for a **summary or dashboard** → `search_notes` + `list_notes` → `create_note`/`update_note` in `dashboards/`.
     - If the answer is clearly **general knowledge** with no vault dependency → answer directly.

2. **Real-world examples**
   - Add at least 4 examples: bug context, decision recall, concept lookup, project status dashboard.
   - Each example must show the exact tool sequence and expected final behavior.

3. **Dashboard creation**
   - Dashboards are Markdown notes stored in `dashboards/`.
   - Frontmatter must include `type: dashboard`, `title`, `tags`, and `updated`.
   - Dashboard types:
     - `project-status.md` — list recent decisions, concepts, and open questions.
     - `decisions-pending.md` — list decisions marked with `status: pending`.
     - `recent-concepts.md` — list concepts created in the last N days.
   - Use `create_note` with overwrite for existing dashboards.

4. **Stop conditions**
   - Stop searching if 3 consecutive searches return no relevant results.
   - Stop reading after at most 5 notes unless the user asks for more.
   - Never persist without explicit user request or clear inference.

### Non-Functional Requirements

1. Skill file must remain under 350 lines.
2. Must follow existing skill frontmatter and navigation conventions.
3. Must pass `python scripts/validate-skills.py`.
