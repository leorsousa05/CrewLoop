# Spec Delta: Skill Bundle Memory Alignment

## Current State
- `obsidian-second-brain/SKILL.md` description: "prior decisions, concepts, project history, dashboards".
- `architect/SKILL.md` brownfield discovery step: "Look for ADRs — existing decisions in `docs/decisions/` or similar".
- `shipper/SKILL.md` step 7 contains a commented placeholder (lines 346-352) about updating `Journal/loop-engineering-agents.md`.
- `tester`, `maintainer`, `product-manager`, `researcher` mention "prior decisions" generically.

## Changes

### MODIFIED
- `skills/obsidian-second-brain/SKILL.md`
  - Replace description trigger phrase with: "prior decisions in Knowledge/ or Journal/, durable knowledge in Knowledge/, session outcomes in Journal/, user profile facts in Memory/, temporary drafts in Notes/, or anything where persisted context would improve the answer."
- `skills/architect/SKILL.md`
  - In MEMORY & CONTEXT, add explicit line: "Project ADRs live in the repository's `specs/decisions/`; vault decisions and durable knowledge live in `Knowledge/`."
  - In brownfield discovery step 6, replace "`docs/decisions/` or similar" with "`specs/decisions/` for project ADRs and `Knowledge/` for vault decisions".
- `skills/shipper/SKILL.md`
  - Replace commented placeholder block with an actionable bullet under the archive step:
    - "Invoke `obsidian-second-brain` to move the spec link from `## Specs / ### Active` to `## Specs / ### Archived` in `Journal/loop-engineering-agents.md`. Do not read or write `~/.lea` directly."
- `skills/tester/SKILL.md`
  - Update MCP Tools Reference: "Find prior testing heuristics in `Knowledge/` and bug patterns in `Journal/bugs*`."
- `skills/maintainer/SKILL.md`
  - Update MCP Tools Reference: "Find prior runbooks and debt decisions in `Knowledge/` and incidents in `Journal/incidents*`."
- `skills/product-manager/SKILL.md`
  - Update MCP Tools Reference: "Find prior product decisions and success metrics in `Knowledge/` and user feedback in `Journal/`."
- `skills/researcher/SKILL.md`
  - Update MCP Tools Reference: "Find prior research and technology decisions in `Knowledge/` and experiment results in `Journal/`."

### REMOVED
- Old vault folder names (`concepts/`, `projects/`, `docs/decisions/`, `dashboards/`) from `skills/*/SKILL.md`.

## Migration Notes
No runtime migration. `specs/decisions/` remains the project ADR location.

## Backward Compatibility
Non-breaking. Skill instructions become more precise; no external contracts changed.
