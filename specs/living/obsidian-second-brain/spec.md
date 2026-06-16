> # Living Spec: obsidian-second-brain
> 
> ## Purpose
> 
> The `obsidian-second-brain` skill turns the local Obsidian vault at `~/.lea` into a long-term memory layer for the Loop Engineering Agents bundle.
> 
> ## Current Behavior
> 
> - Triggers aggressively on knowledge retrieval, memory, RAG, second brain, Obsidian, decisions, concepts, project history, dashboards, and summaries.
> - Orchestrates MCP tools: `sync_from_bundle`, `search_notes`, `read_note`, `learn_from_text`, `create_note`, `update_note`, `get_related_notes`, `list_notes`.
> - Follows a workflow decision tree:
>   - Existing knowledge → search → read → answer
>   - Relationships → search → `get_related_notes` → summarize
>   - New concept/decision → privacy check → `learn_from_text`
>   - Dashboard request → `list_notes`/`search_notes` → `create_note` in `dashboards/`
>   - General knowledge → answer directly
> - Stop conditions: 3 empty searches, 5 reads max, privacy failures block persistence.
> - Uses English folders: `concepts/`, `decisions/`, `projects/`, `dashboards/`.
> 
> ## Files
> 
> - `skills/obsidian-second-brain/SKILL.md`
> - `references/obsidian-mcp-usage.md`
