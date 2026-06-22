# Spec: Expand workflow documentation with complete end-to-end diagram

## Acceptance criteria

1. `docs/docs/workflow.md` contains a comprehensive Mermaid diagram showing the full CrewLoop workflow.
2. The documentation explains:
   - User entry points and how tasks are triggered.
   - Artifacts produced at each phase (brief, specs, design spec, code, review report, PR).
   - Decision branches (Designer vs Engineer, approved vs changes required).
   - Rework loops (Reviewer → Engineer, Engineer → Architect).
   - AFK mode behavior.
   - Obsidian second-brain / memory integration.
   - Supporting skills and when they are invoked.
   - Spec archiving on ship.
3. `npm run build` inside `docs/` succeeds.
4. `python scripts/validate-skills.py` still passes.
