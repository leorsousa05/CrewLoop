# Proposal: Workflow and Skill Coherence Fixes

## Status
- **State:** active
- **Created:** 2026-07-05
- **Author:** codex

## Problem Statement
The core CrewLoop instructions are internally inconsistent. Several skills describe subagents as "read-only" while still instructing them to write files, the orchestrator workflow does not consistently explain what it just did, and the shared conventions reference an output block that the skills do not actually implement.

These inconsistencies make the workflow harder to follow, reduce trust in the instructions, and create avoidable routing ambiguity for future changes.

## Goals
1. Make the main workflow instructions internally consistent across the core skills and shared references.
2. Improve the orchestrator handoff summary and expand guidance for when to use specialist subagents.
3. Align the repository-level rules, workflow reference, and skill docs so they describe the same flow.
4. Tighten the supporting skill handoff language so it always reports findings back to the orchestrator or invoking core skill.

## Non-Goals
- Changing runtime behavior of the CLI or dashboard.
- Rewriting all supporting skills beyond what is needed to align core workflow rules.
- Adding new skills or removing existing ones.

## Constraints
- Keep changes documentation-first.
- Preserve the existing hub-and-spoke workflow.
- Keep the correction scoped to the flow instructions and shared conventions.

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Updating shared routing rules can create mismatches with other skill docs | Medium | Patch the shared references and the core skill docs together |
| Clarifying subagent usage can introduce accidental overlap between core and supporting skills | Medium | Explicitly separate read-only analysis help from file-writing responsibilities |

## Success Criteria
- [ ] Orchestrator, architect, designer, reviewer, and shipper instructions describe the same routing model.
- [ ] Read-only subagent guidance no longer instructs subagents to write files.
- [ ] Shared conventions no longer reference an undefined output block.
- [ ] Core workflow docs include a clearer "what was done" style handoff summary.
