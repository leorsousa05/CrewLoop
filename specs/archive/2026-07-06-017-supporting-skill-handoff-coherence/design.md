# Design: Supporting Skill Handoff Coherence

## Overview
This change harmonizes the remaining specialist helper skills so their handoff language matches the rest of the bundle. The update is limited to wording and summary expectations.

## Proposed Directory & File Structure
```text
crewloop/
├── specs/
│   └── changes/017-supporting-skill-handoff-coherence/
│       ├── .spec.yaml
│       ├── proposal.md
│       ├── design.md
│       └── tasks.md
└── skills/
    ├── project-brainstorm/SKILL.md      (Modified)
    ├── frontend-architect/SKILL.md      (Modified)
    ├── schema-designer/SKILL.md         (Modified)
    └── devops-specialist/SKILL.md       (Modified)
```

## Code Architecture & Design Patterns
- **Architecture Model:** Documentation-driven workflow governance.
- **Design Patterns Used:** Consistent handoff summaries, centralized routing, and progressive disclosure.

## Data Model
No runtime data model changes.

## API Contracts
No API changes. This is instruction-only work.

## Flow Diagrams
### Handoff Pattern
1. Specialist skill does its niche work.
2. Skill states what it inspected or produced.
3. Skill returns findings to the Orchestrator.

## State Management
Conversation state remains with the Orchestrator. The skill only reports a concise summary.

## Error Handling
If a specialist skill requires a broader decision, it should still hand the decision back to the Orchestrator rather than routing directly onward.

## Performance Considerations
No runtime impact.

## Security Considerations
No security impact.
