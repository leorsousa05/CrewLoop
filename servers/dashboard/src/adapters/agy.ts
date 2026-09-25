import type { AgentSource, DashboardEvent, EventType } from '../types';
import { canonicalSkillName } from '../lib/skills';
import { normalizeTokenUsage, type TokenUsageAliases } from '../telemetry/token-usage';
import { isPlainObject, isSafeTokenCount, parseCapturedAt, stableUsageId } from './usage-utils';

export interface AgyHookPayload {
  hook_event_name?: string;
  conversationId?: string;
  sessionId?: string;
  session_id?: string;
  invocation_id?: string;
  invocationId?: string;
  toolCallId?: string;
  toolCall?: {
    id?: string;
    callId?: string;
    invocation_id?: string;
    name?: string;
    args?: Record<string, unknown>;
  };
  toolName?: string;
  stepIdx?: number;
  responseId?: string;
  timestamp?: number | string;
  durationMs?: number;
  duration_ms?: number;
  success?: boolean;
  llm_request?: {
    model?: string;
  };
  llm_response?: {
    candidates?: Array<{ finishReason?: string }>;
    usageMetadata?: Record<string, unknown>;
  };
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
  AfterModel: 'tool_end',
};

const MODEL_USAGE_ALIASES: TokenUsageAliases = {
  input: ['promptTokenCount'],
  output: ['candidatesTokenCount'],
  cacheRead: ['cachedContentTokenCount'],
  cacheWrite: [],
  reasoning: ['thoughtsTokenCount'],
  total: ['totalTokenCount'],
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
      return tool === 'Bash' ? redactCommandLine(value) : value;
    }
  }

  if (tool && fields.length > 0) {
    return undefined;
  }

  const serialized = JSON.stringify(args);
  if (serialized === '{}') return undefined;
  return serialized.length > 200 ? `${serialized.slice(0, 197)}...` : serialized;
}

const MAX_DETAIL_LENGTH = 200;
const SECRET_VALUE_RE =
  /(\b(?:api[-_]?key|secret|token|password|passwd|authorization|bearer|credential)s?\s*[=:]\s*(?:bearer\s+)?[^\s"'&;]+|--(?:api[-_]?key|secret|token|password|authorization|bearer)(?:[=-]\S+|\s+\S+))/gi;

function redactCommandLine(value: string): string {
  const redacted = value.replace(SECRET_VALUE_RE, (match) => {
    const eqIndex = match.search(/[=:]/);
    if (eqIndex !== -1) return `${match.slice(0, eqIndex + 1)}<redacted>`;
    const flagMatch = match.match(/^--[^\s]+/);
    if (flagMatch) return `${flagMatch[0]} <redacted>`;
    return '<redacted>';
  });
  return redacted.length > MAX_DETAIL_LENGTH
    ? `${redacted.slice(0, MAX_DETAIL_LENGTH - 3)}...`
    : redacted;
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
  return match ? canonicalSkillName(match[1]) : undefined;
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
  const token_usage = eventName === 'AfterModel'
    ? normalizeFinalModelUsage(payload)
    : undefined;
  if (eventName === 'AfterModel' && !token_usage) {
    return undefined;
  }
  const toolCall = payload.toolCall;
  const rawToolName = toolCall?.name || payload.toolName;
  const tool = eventName === 'AfterModel' ? 'Model' : normalizeToolName(rawToolName);
  const args = toolCall?.args;
  const skill = inferSkillFromReadPath(tool, args);
  const invocation_id = payload.invocation_id
    ?? payload.invocationId
    ?? payload.toolCallId
    ?? toolCall?.invocation_id
    ?? toolCall?.callId
    ?? toolCall?.id
    ?? (eventName === 'AfterModel' ? payload.responseId : undefined);

  return {
    id: token_usage?.measurementId ?? generateId(session_id, stepIdx),
    timestamp: token_usage?.capturedAt ?? Date.now(),
    source: 'agy' as AgentSource,
    session_id,
    event_type,
    invocation_id,
    tool,
    status: event_type === 'tool_start'
      ? 'running'
      : event_type === 'tool_end'
        ? payload.error !== undefined || payload.success === false ? 'error' : 'success'
        : undefined,
    duration_ms: typeof payload.durationMs === 'number'
      ? payload.durationMs
      : payload.duration_ms,
    skill,
    detail: extractDetail(tool, args),
    input: args,
    output: payload.error !== undefined ? { error: payload.error } : undefined,
    token_usage,
    workspacePath: payload.workspacePaths?.[0],
  };
}

function normalizeFinalModelUsage(payload: AgyHookPayload) {
  const response = payload.llm_response;
  const usage = response?.usageMetadata;
  const totalTokens = usage?.totalTokenCount;
  const hasFinalCandidate = response?.candidates?.some(
    (candidate) => typeof candidate.finishReason === 'string' && candidate.finishReason.length > 0
  );
  const capturedAt = parseCapturedAt(payload.timestamp);
  if (!isPlainObject(usage) || !isSafeTokenCount(totalTokens) || totalTokens <= 0) {
    return undefined;
  }
  if (!hasFinalCandidate || capturedAt === undefined) {
    return undefined;
  }

  const stableIdentity = payload.responseId
    ?? (Number.isSafeInteger(payload.stepIdx) ? String(payload.stepIdx) : payload.timestamp);
  if (stableIdentity === undefined) {
    return undefined;
  }
  return normalizeTokenUsage({
    source: 'agy',
    rawUsage: usage,
    model: payload.llm_request?.model,
    eventId: stableUsageId('agy:model-response', stableIdentity, totalTokens),
    capturedAt,
    semantics: 'delta',
    aliases: MODEL_USAGE_ALIASES,
    cursorKey: 'agy:model-response',
    coverage: 'complete',
  });
}
