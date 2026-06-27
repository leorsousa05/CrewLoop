# Skill Inference Delta

## Current behavior

`SkillInferenceEngine.infer` maps common tool names to skills heuristically:

- `Task`, `Agent` → `orchestrator`
- `Read`, `Grep`, `Glob`, `WebSearch`, `FetchURL` → `researcher`
- `Edit`, `Write`, `Bash` → `engineer`
- `Skill` → explicit skill from `detail`
- `Bash` + git command → `shipper`

This causes the dashboard to display a skill even when the user never invoked one.

## New behavior

Remove generic tool-to-skill mapping. Only the following signals produce a skill:

1. `skill_change` event with `skill` field → explicit.
2. `Skill` tool with valid skill name in `detail` → explicit.
3. `Bash` tool with git command in `detail` → heuristic `shipper`.
4. Preserve existing explicit active skill when no new explicit signal arrives.
5. Everything else → no skill (`skill: undefined`, `confidence: 'unknown'`).

## UI changes

- `ActiveSkillPanel`: render a "no active skill" fallback instead of defaulting to `UNKNOWN`.
- `Overview`: recent session cards show "No active skill" fallback text; top skills ignore sessions without a skill.

## Tests

- Update `SkillInferenceEngine` tests to assert unknown for generic `Bash`, `Read`, `Edit`, `Write`, `Task`, `Agent`.
- Keep tests for explicit skill, git command, and explicit preservation.
