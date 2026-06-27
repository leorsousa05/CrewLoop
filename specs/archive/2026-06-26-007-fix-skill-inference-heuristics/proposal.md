# Proposal: Fix skill inference heuristics in dashboard

## Problem

The CrewLoop dashboard displays an "Active Skill" for every agent session. The current `SkillInferenceEngine` guesses the active skill from the tool name:

- `Bash` → `engineer`
- `Read`/`Grep`/`Glob`/`WebSearch`/`FetchURL` → `researcher`
- `Edit`/`Write` → `engineer`
- `Task`/`Agent` → `orchestrator`

This heuristic is too aggressive. When the user asks Kimi a simple question or runs a generic command without invoking any CrewLoop skill, the dashboard still shows `engineer`, `researcher`, or `orchestrator`. The user reports that the skill is sometimes wrong and sometimes appears even though no skill was invoked.

## Goal

Show a skill only when there is an explicit signal. When there is no explicit signal, indicate that the agent is running without an active skill/role.

## Scope

- Remove generic tool-to-skill heuristic mapping from `SkillInferenceEngine`.
- Keep only these inference paths:
  1. Explicit `skill_change` event.
  2. Tool named `Skill` with a valid skill name in `detail`.
  3. `Bash` commands that match git operations → `shipper` (heuristic, but strongly correlated).
  4. Preserve an already explicit active skill until another explicit signal replaces it.
  5. Fall back to `unknown` when nothing matches.
- Update `ActiveSkillPanel` and `Overview` UI to render a "no active skill" state gracefully.
- Update `SkillInferenceEngine` tests to match the new behavior.

## Non-goals

- No changes to the shim, CLI, or hook installation.
- No new skill metadata or registry changes.
- No changes to explicit skill invocation via `Skill` tool or `skill_change` events.
