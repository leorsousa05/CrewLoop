import type { AgentSource, DashboardEvent, EventType } from '../types';

export interface AgyHookPayload {
  hook_event_name?: string;
  conversationId?: string;
  sessionId?: string;
  session_id?: string;
  toolCall?: {
    name?: string;
    args?: Record<string, unknown>;
  };
  toolName?: string;
  stepIdx?: number;
  error?: string;
  workspacePaths?: string[];
  transcriptPath?: string;
  artifactDirectoryPath?: string;
}

const EVENT_MAP: Record<string, EventType> = {
  PreToolUse: 'tool_start',
  PostToolUse: 'tool_end',
  SessionStart: 'session_start',
  SessionEnd: 'session_end',
  Stop: 'session_end',
};

const TOOL_NAME_MAP: Record<string, string> = {
  run_command: 'Bash',
  view_file: 'Read',
  write_to_file: 'Write',
  replace_file_content: 'Edit',
  multi_replace_file_content: 'Edit',
  list_dir: 'Glob',
  find_by_name: 'Glob',
  grep_search: 'Grep',
  search_web: 'WebSearch',
  read_url_content: 'FetchURL',
  ask_question: 'AskUserQuestion',
  generate_image: 'ReadMediaFile',
  manage_task: 'Task',
  invoke_subagent: 'Agent',
  define_subagent: 'Agent',
  manage_subagents: 'Agent',
  send_message: 'Agent',
  schedule: 'CronCreate',
  list_permissions: 'Bash',
  ask_permission: 'AskUserQuestion',
};

const DETAIL_FIELDS: Record<string, string[]> = {
  Bash: ['CommandLine'],
  Read: ['AbsolutePath'],
  Write: ['TargetFile'],
  Edit: ['TargetFile'],
  Glob: ['DirectoryPath', 'Pattern'],
  Grep: ['Query'],
  WebSearch: ['query'],
  FetchURL: ['Url'],
  AskUserQuestion: [],
  ReadMediaFile: [],
  Task: [],
  Agent: [],
  CronCreate: [],
};

function normalizeToolName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  return TOOL_NAME_MAP[name] || name;
}

function extractDetail(tool: string | undefined, args: Record<string, unknown> | undefined): string | undefined {
  if (!args || typeof args !== 'object') return undefined;

  const fields = tool ? DETAIL_FIELDS[tool] || [] : [];
  for (const field of fields) {
    const value = args[field];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  if (tool && fields.length > 0) {
    return undefined;
  }

  const serialized = JSON.stringify(args);
  if (serialized === '{}') return undefined;
  return serialized.length > 200 ? `${serialized.slice(0, 197)}...` : serialized;
}

const SKILL_PATH_RE = /[\\/]skills[\\/]([^\\/]+)[\\/]SKILL\.md$/i;

function inferSkillFromReadPath(
  tool: string | undefined,
  args: Record<string, unknown> | undefined
): string | undefined {
  if (tool !== 'Read' || !args || typeof args !== 'object') return undefined;

  const rawPath = args.AbsolutePath || args.path || args.filePath || args.file_path;
  if (typeof rawPath !== 'string') return undefined;

  const match = rawPath.match(SKILL_PATH_RE);
  return match ? match[1] : undefined;
}

function generateId(sessionId: string, stepIdx: number | undefined): string {
  const suffix = stepIdx !== undefined ? String(stepIdx) : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `agy:${sessionId}:${suffix}`;
}

export function normalizeAgy(payload: AgyHookPayload): DashboardEvent | undefined {
  const eventName = payload.hook_event_name || 'PostToolUse';
  const event_type = EVENT_MAP[eventName];
  if (!event_type) {
    return undefined;
  }

  const session_id = payload.conversationId || payload.sessionId || payload.session_id || 'unknown';
  const stepIdx = typeof payload.stepIdx === 'number' ? payload.stepIdx : undefined;
  const toolCall = payload.toolCall;
  const rawToolName = toolCall?.name || payload.toolName;
  const tool = normalizeToolName(rawToolName);
  const args = toolCall?.args;
  const skill = inferSkillFromReadPath(tool, args);

  return {
    id: generateId(session_id, stepIdx),
    timestamp: Date.now(),
    source: 'agy' as AgentSource,
    session_id,
    event_type,
    tool,
    skill,
    detail: extractDetail(tool, args),
    input: args,
    output: payload.error !== undefined ? { error: payload.error } : undefined,
    workspacePath: payload.workspacePaths?.[0],
  };
}
