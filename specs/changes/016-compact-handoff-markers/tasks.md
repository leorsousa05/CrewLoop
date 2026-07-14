# Tasks: Direct Handoff Without Commands

- [ ] Update `references/conventions.md` to define direct handoff behavior and remove command prompts.
- [ ] Update `AGENTS.md` and `references/workflow.md` to match the new routing language.
- [ ] Replace the command-style handoff in every affected `skills/*/SKILL.md` with direct handoff wording.
- [ ] Verify there are no remaining occurrences of the old `Para continuar, execute:` / `To proceed, execute:` wording, the `Next:` label, or bare command markers.
- [ ] Run `python scripts/validate-skills.py`.
