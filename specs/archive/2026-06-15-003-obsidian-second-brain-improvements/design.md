> # Design: obsidian-second-brain Improvements
> 
> ## Data Model
> 
> No new code interfaces. Dashboards are plain Markdown notes with frontmatter.
> 
> ## Dashboard Schema
> 
> ```yaml
> ---
> type: dashboard
> title: project status
> tags: [dashboard, auto-generated]
> updated: 2026-06-15T14:00:00Z
> ---
> ```
> 
> ## Workflow Decision Tree
> 
> ```
> User prompt
>   │
>   ├─ asks for existing fact/decision/concept ──→ search → read → answer
>   │
>   ├─ asks for relationships/gaps ────────────────→ search → get_related_notes → answer
>   │
>   ├─ shares new concept/decision ────────────────→ learn_from_text → confirm
>   │
>   ├─ asks for summary/dashboard ─────────────────→ search + list_notes → create/update dashboards/X.md
>   │
>   └─ general knowledge question ─────────────────→ answer directly
> ```
> 
> ## Files
> 
> - `skills/obsidian-second-brain/SKILL.md` (updated)
