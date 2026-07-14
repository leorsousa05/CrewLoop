# Design: DiamondBlock as the Default Discovery Layer

## Overview
DiamondBlock already exposes three capabilities that matter to CrewLoop discovery:
- durable memory retrieval and distillation
- semantic search over memories and project context
- codebase indexing/search through its local indexer

This change updates the CrewLoop workflow so the Hub uses DiamondBlock as the first discovery
step whenever it is present. The Hub should ask DiamondBlock for context, semantic search, and
targeted codebase retrieval before resorting to broad file-by-file inspection.

## Behavioral Contract
When DiamondBlock is configured and installed:
1. The CrewLoop Hub loads it first during discovery to retrieve session/project context.
2. The Hub uses it again whenever the task requires codebase search, historical decisions,
   or any other read-only exploration that DiamondBlock can answer.
3. If the current codebase has not been indexed or has drifted, the Hub can instruct
   DiamondBlock to index it before searching.
4. Manual file inspection remains available, but only after DiamondBlock has narrowed the
   search space or when direct reading is still required.

When DiamondBlock is not available:
1. The Hub proceeds with the existing subagent and manual exploration flow.
2. No routing failure should occur just because the server is absent.

## Affected Surfaces
- `skills/crewloop-hub/SKILL.md` gets new discovery guidance that prefers DiamondBlock for
  context retrieval, codebase search, and other read-only discovery.
- `skills/diamondblock/SKILL.md` gains explicit codebase-search/indexing language.
- `AGENTS.md` and `references/workflow.md` describe DiamondBlock as a first-class helper
  when the server is active.
- `references/conventions.md` can note DiamondBlock as the preferred discovery tool for memory,
  semantic code search, and read-only exploration.

## Risks
- Overusing DiamondBlock could hide useful detail in the raw codebase, so the docs need to
  keep file inspection as a fallback.
- If the server is configured but stale, the Hub should still be able to re-index rather than
  trust old results.
- The docs must avoid implying that DiamondBlock is mandatory; it is conditional on
  installation and configuration.

## Validation
- Verify the new guidance appears in the Hub, workflow, and skill docs.
- Verify the skill description reflects codebase indexing/search, not just memory.
- Run `python3 scripts/validate-skills.py` after any SKILL.md edits.
