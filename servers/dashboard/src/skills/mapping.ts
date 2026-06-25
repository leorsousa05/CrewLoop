import type { ToolToSkillMap } from '../types';

export const DEFAULT_TOOL_TO_SKILL_MAP: ToolToSkillMap = {
  Task: 'orchestrator',
  Agent: 'orchestrator',
  Read: 'researcher',
  Grep: 'researcher',
  Glob: 'researcher',
  WebSearch: 'researcher',
  FetchURL: 'researcher',
  Edit: 'engineer',
  Write: 'engineer',
  Bash: 'engineer',
  Skill: undefined,
};

export function inferFromTool(toolName: string): string | undefined {
  return DEFAULT_TOOL_TO_SKILL_MAP[toolName];
}

export function inferFromGitCommand(command: string): string | undefined {
  if (/\b(git\s+(commit|push|branch|merge|tag|checkout))\b/.test(command)) {
    return 'shipper';
  }
  return undefined;
}
