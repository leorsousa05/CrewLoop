# Tasks: Fix skill inference heuristics

## Analysis

- [x] Identify root cause: `DEFAULT_TOOL_TO_SKILL_MAP` maps every common tool to a skill.
- [x] Decide to keep only explicit signals + git heuristic.
- [x] Identify affected UI components: `ActiveSkillPanel`, `Overview`.

## Implementation

- [x] Remove `DEFAULT_TOOL_TO_SKILL_MAP` from `servers/dashboard/src/skills/mapping.ts`.
- [x] Remove the `inferFromTool` call from `SkillInferenceEngine.infer` in `servers/dashboard/src/skills/infer.ts`.
- [x] Ensure explicit skill preservation logic remains intact.
- [x] Update `ActiveSkillPanel` to render "no active skill" fallback.
- [x] Update `Overview` recent sessions and top skills to handle undefined skill.

## Testing

- [x] Update `servers/dashboard/src/skills/infer.test.ts` expectations.
- [x] Add tests for generic `Bash`/`Read` returning `unknown`.
- [x] Run `npm run build && npm test` in `servers/dashboard`.

## Verification

- [x] Trigger a generic Kimi `Bash` tool call without invoking a skill.
- [x] Confirm dashboard shows "no active skill" instead of `engineer`.
