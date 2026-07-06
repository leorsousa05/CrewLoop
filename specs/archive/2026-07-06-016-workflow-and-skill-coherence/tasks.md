# Tasks: Workflow and Skill Coherence Fixes

## Setup
- [x] Confirm the scope and files affected by the workflow wording changes
- [x] Keep all edits within the shared workflow docs and core skill docs

## Implementation
- [x] Update `references/conventions.md` to remove the undefined output-block requirement
- [x] Update `references/workflow.md` to align the diagram and routing rules
- [x] Update `AGENTS.md` to list the full 18-skill bundle and reconcile helper skill usage
- [x] Update `skills/orchestrator/SKILL.md` to add clearer action summaries and broader subagent guidance
- [x] Update `skills/architect/SKILL.md` and `skills/designer/SKILL.md` to fix read-only subagent contradictions
- [x] Review `skills/reviewer/SKILL.md` and `skills/shipper/SKILL.md` for shared routing alignment
- [x] Harmonize supporting skill handoff language and summary expectations

## Testing
- [x] Re-run `python3 scripts/validate-skills.py`
- [x] Read the updated core docs for consistency after patching
- [x] Re-run `python3 scripts/validate-skills.py` after supporting-skill alignment

## Verification
- [x] Confirm no skill still says a read-only subagent should write files
- [x] Confirm Orchestrator handoff text now includes a summary of what was done
- [x] Confirm shared conventions and workflow reference no longer contradict each other
- [x] Confirm supporting skills consistently return findings to the Orchestrator or invoking skill

## Completion
- [x] Leave the change ready for review
