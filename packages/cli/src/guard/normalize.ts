import type { NormalizedGuardEvent } from './guard.types';

export interface KimiHookPayload {
  hook_event_name?: string;
  session_id?: string;
  cwd?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_output?: string | Record<string, unknown>;
}

export interface ClaudeHookPayload {
  hook_event_name?: string;
  session_id?: string;
  cwd?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_response?: string | Record<string, unknown>;
}

export interface CodexHookPayload {
  hook_event_name?: string;
  session_id?: string;
  cwd?: string;
  tool?: { name?: string; input?: Record<string, unknown> };
}

export interface AgyHookPayload {
  hook_event_name?: string;
  sessionId?: string;
  session_id?: string;
  conversationId?: string;
  cwd?: string;
  toolName?: string;
  toolCall?: { name?: string; args?: Record<string, unknown> };
}

export interface OpenCodeHookPayload {
  tool?: { name?: string; args?: Record<string, unknown> };
  cwd?: string;
  session_id?: string;
}

function extractCommand(input: Record<string, unknown> | undefined): string | undefined {
  if (!input) return undefined;
  if (typeof input.command === 'string') return input.command;
  if (typeof input.CommandLine === 'string') return input.CommandLine;
  if (typeof input.commandLine === 'string') return input.commandLine;
  if (Array.isArray(input.args) && typeof input.args[0] === 'string') {
    return input.args.join(' ');
  }
  return undefined;
}

export function normalizePayload(
  agent: string,
  raw: unknown
): NormalizedGuardEvent | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;

  const payload = raw as Record<string, unknown>;
  const session_id =
    typeof payload.session_id === 'string'
      ? payload.session_id
      : typeof payload.sessionId === 'string'
      ? payload.sessionId
      : typeof payload.conversationId === 'string'
      ? payload.conversationId
      : 'unknown';
  const cwd = typeof payload.cwd === 'string' ? payload.cwd : process.cwd();

  switch (agent) {
    case 'kimi': {
      const p = payload as unknown as KimiHookPayload;
      return {
        agent,
        session_id: p.session_id || session_id,
        tool: p.tool_name || 'unknown',
        input: p.tool_input,
        cwd: p.cwd || cwd,
      };
    }
    case 'claude': {
      const p = payload as unknown as ClaudeHookPayload;
      return {
        agent,
        session_id: p.session_id || session_id,
        tool: p.tool_name || 'unknown',
        input: p.tool_input,
        cwd: p.cwd || cwd,
      };
    }
    case 'codex': {
      const p = payload as unknown as CodexHookPayload;
      const tool =
        typeof p.tool === 'object' && p.tool !== null
          ? (p.tool as { name?: string }).name
          : undefined;
      const input =
        typeof p.tool === 'object' && p.tool !== null
          ? (p.tool as { input?: Record<string, unknown> }).input
          : undefined;
      return {
        agent,
        session_id: p.session_id || session_id,
        tool: tool || 'unknown',
        input,
        cwd: p.cwd || cwd,
      };
    }
    case 'agy': {
      const p = payload as unknown as AgyHookPayload;
      const toolName =
        p.toolCall?.name || p.toolName || (typeof p.toolName === 'string' ? p.toolName : 'unknown');
      const input = p.toolCall?.args;
      return {
        agent,
        session_id: p.conversationId || p.sessionId || p.session_id || session_id,
        tool: toolName,
        input,
        cwd: p.cwd || cwd,
      };
    }
    case 'opencode': {
      const p = payload as unknown as OpenCodeHookPayload;
      const tool =
        typeof p.tool === 'object' && p.tool !== null
          ? (p.tool as { name?: string }).name
          : undefined;
      const input =
        typeof p.tool === 'object' && p.tool !== null
          ? (p.tool as { args?: Record<string, unknown> }).args
          : undefined;
      return {
        agent,
        session_id: p.session_id || session_id,
        tool: tool || 'unknown',
        input,
        cwd: p.cwd || cwd,
      };
    }
    default:
      return {
        agent,
        session_id,
        tool: typeof payload.tool_name === 'string' ? payload.tool_name : 'unknown',
        input:
          typeof payload.tool_input === 'object' && payload.tool_input !== null
            ? (payload.tool_input as Record<string, unknown>)
            : undefined,
        cwd,
      };
  }
}

export { extractCommand };
