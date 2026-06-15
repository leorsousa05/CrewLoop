> # Design: Supporting Team Skills
> 
> ## Data Model
> 
> Each skill is a single `SKILL.md` file inside `skills/<skill-name>/`.
> 
> ## Architecture
> 
> The four skills are read-only advisors that the orchestrator may route to before sending work to architect or engineer:
> 
> ```
> Orchestrator → Researcher (optional)
> Orchestrator → Product-Manager (optional)
> Orchestrator → Architect → Engineer → Reviewer → Shipper
> Orchestrator → Maintainer (for incidents/debt)
> Engineer → Tester (optional QA review)
> ```
> 
> ## Interface
> 
> No code interfaces. Skills communicate through the orchestrator's routing menu.
> 
> ## Navigation
> 
> Each skill ends with the standard menu:
> `[O] Orchestrator`, `[A] Architect`, `[E] Engineer`, `[R] Reviewer`, `[S] Shipper`.
> 
> ## Files
> 
> - `skills/tester/SKILL.md`
> - `skills/product-manager/SKILL.md`
> - `skills/maintainer/SKILL.md`
> - `skills/researcher/SKILL.md`
