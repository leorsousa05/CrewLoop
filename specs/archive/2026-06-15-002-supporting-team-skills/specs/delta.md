## Requirements

### Functional Requirements

1. Each new skill must have a valid `SKILL.md` with frontmatter (`name`, `description`).
2. Each skill must define its role, mode, workflow, response rules, and anti-patterns.
3. Each skill must present the standard letter-based navigation menu at the end.
4. Skills must not overlap responsibilities with existing skills (orchestrator, architect, engineer, reviewer, shipper, docs-writer, designer, obsidian-second-brain).

### Skill-Specific Requirements

#### tester
- Trigger on testing strategy, QA, test coverage, bug reproduction, edge cases, and test plans.
- Review existing tests and suggest missing cases.
- Reproduce reported bugs with minimal examples.
- Never write production code or git operations.

#### product-manager
- Trigger on prioritization, success metrics, user stories, product decisions, and roadmap.
- Frame requirements in terms of user value and measurable outcomes.
- Never write code or specs directly; feed inputs to orchestrator/architect.

#### maintainer
- Trigger on bug triage, technical debt, dependency updates, refactoring, and production incidents.
- Classify issues and recommend fixes or rewrites.
- Never implement fixes directly; route to engineer.

#### researcher
- Trigger on technology evaluation, proof-of-concepts, library comparisons, and unknown domains.
- Produce concise research summaries with recommendations.
- Never make final architecture decisions; feed findings to architect.

### Non-Functional Requirements

1. Each skill file should be under 200 lines.
2. Follow the existing skill writing conventions from `references/skill-anatomy.md`.
3. Pass `python scripts/validate-skills.py`.
