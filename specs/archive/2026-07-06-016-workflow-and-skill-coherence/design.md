# Design: Workflow and Skill Coherence Fixes

## Overview
This change harmonizes the instructions for the CrewLoop workflow. The fixes target shared references, the orchestrator, and the core execution skills so the routing model, subagent behavior, and response format are described consistently.

## Proposed Directory & File Structure
```text
crewloop/
├── AGENTS.md                              (Modified)
├── references/
│   ├── conventions.md                     (Modified)
│   └── workflow.md                        (Modified)
├── skills/
│   ├── orchestrator/SKILL.md              (Modified)
│   ├── architect/SKILL.md                (Modified)
│   ├── designer/SKILL.md                 (Modified)
│   ├── reviewer/SKILL.md                 (Modified)
│   └── shipper/SKILL.md                  (Modified, if needed for alignment)
└── specs/
    └── changes/016-workflow-and-skill-coherence/
        ├── .spec.yaml                     (New)
        ├── proposal.md                    (New)
        ├── design.md                      (New)
        └── tasks.md                       (New)
```

## Code Architecture & Design Patterns
- **Architecture Model:** Documentation-driven workflow governance with a single hub-and-spoke routing model.
- **Design Patterns Used:** Centralized orchestration, clear responsibility separation, and progressive disclosure for subagent delegation.

## Data Model
No runtime data model changes are required. The change updates instruction text, routing guidance, and response templates.

## API Contracts
No code API changes are required. The only "contracts" updated here are skill-level behavioral contracts and response format expectations.

## Flow Diagrams
### Workflow Consistency
1. Orchestrator gathers context and records what it just did.
2. Orchestrator may route to supporting skills for read-only analysis.
3. Architect writes the spec, then returns control to the Orchestrator.
4. Designer refines visual direction after spec context exists.
5. Engineer implements from the spec.
6. Reviewer verifies the diff and findings.
7. Shipper packages the reviewed change.

## State Management
State remains in the conversation and in the spec folder. The only structural update is clearer handoff narration and consistent routing instructions.

## Error Handling
If a skill instruction conflicts with the shared conventions, prefer the shared conventions and update the skill text to remove ambiguity. If a subagent is described as read-only, it must not be instructed to write files.

## Performance Considerations
No runtime performance impact.

## Security Considerations
No security model changes. The main concern is reducing instruction ambiguity so sensitive routing and review steps remain explicit.
