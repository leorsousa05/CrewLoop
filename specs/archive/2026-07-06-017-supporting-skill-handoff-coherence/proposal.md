# Proposal: Supporting Skill Handoff Coherence

## Status
- **State:** active
- **Created:** 2026-07-06
- **Author:** codex

## Problem Statement
Several supporting skills already return to the Orchestrator, but their handoff language is inconsistent. Some describe only the menu return, some imply output without summarizing what was done, and the special-purpose helpers do not all say what they should hand back.

This makes the bundle harder to read and weakens the shared routing model.

## Goals
1. Normalize handoff summaries for the remaining specialist helpers.
2. Keep the language aligned with the central Orchestrator flow.
3. Avoid introducing any new routing or responsibility confusion.

## Non-Goals
- No runtime or code changes.
- No additional skills.
- No changes to the core routing model already corrected in the previous sweep.

## Constraints
- Documentation-only change.
- Preserve existing role boundaries.
- Keep the wording concise and consistent with shared conventions.

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Small wording differences may still remain between supporting skills | Low | Apply the same handoff pattern across the selected skills |
| Over-editing could make helper skills sound like core skills | Low | Keep each helper focused on its own output type |

## Success Criteria
- [ ] Remaining specialist helpers explicitly summarize what they produced.
- [ ] Remaining specialist helpers clearly return findings to the Orchestrator.
- [ ] Supporting skill phrasing matches the core workflow conventions.
