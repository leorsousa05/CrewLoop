# Spec: Expand Docusaurus documentation with deep skill guides and richer navigation

## Acceptance criteria

1. Docusaurus sidebar has at least these sections: Getting Started, Why CrewLoop, Concepts, The Crew (Core + Supporting), Workflow, Usage Examples, Installation, Contributing.
2. Each core skill page explains: role, responsibilities, when to invoke, concrete examples, input/output artifacts, critical rules, anti-patterns, and next skill handoff.
3. Workflow documentation has a simplified high-level view and a detailed phase-by-phase view.
4. At least three end-to-end usage examples are documented.
5. `npm run build` inside `docs/` succeeds.
6. `python scripts/validate-skills.py` still passes.
