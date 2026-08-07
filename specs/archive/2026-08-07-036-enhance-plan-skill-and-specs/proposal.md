# Proposal: Enhance CrewLoop Plan Skill & Spec Quality

## WHY

While `crewloop:plan` effectively synthesizes briefs and creates specs, AI implementation agents (`crewloop:code`) frequently run into ambiguity due to abstract design descriptions, missing edge case contracts, and un-verifiable task lists. Enforcing explicit type signatures, edge case matrices, and per-task verification commands eliminates guesswork downstream.

## Goals

- Elevate `design.md` quality with mandatory interface signatures and edge case handling matrices.
- Make `tasks.md` atomic, dependency-aware, and paired with verifiable shell execution commands.
- Enhance `crewloop:plan/SKILL.md` to run codebase exploration probes before asking questions and to validate generated specs before handoff.
- Ensure 100% compatibility with existing transition contracts and pass `python3 scripts/validate-skills.py`.

## Non-Goals

- Changing the auto-routing workflow or transition contract targets.
- Modifying the 6-core skill team structure.
