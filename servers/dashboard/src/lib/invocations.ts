import type { ClientEvent } from '../types';
import { classifyOperation } from './operations';

const MAX_EVENTS = 100;

export interface ToolInvocation {
  id: string;
  tool: string;
  eventType: string;
  status: 'running' | 'success' | 'error' | string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  detail?: string;
  skill?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  meta?: boolean;
}

export interface FileOp {
  id: string;
  type: 'read' | 'edit' | 'other';
  status: string;
  timestamp: number;
  tool: string;
  snippet?: string;
  skill?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  lineHint?: string;
}

export interface FileEntry {
  path: string;
  ops: FileOp[];
  snippet?: string;
}

function statusFromEvent(ev: ClientEvent): string {
  return ev.status || (ev.event_type && ev.event_type.endsWith('_end') ? 'success' : 'meta');
}

export function operationType(tool: string): 'read' | 'edit' | 'other' {
  return classifyOperation(tool);
}

export function projectInvocations(events: ClientEvent[]): ToolInvocation[] {
  const chronological = events.slice().reverse();
  const invocations: ToolInvocation[] = [];
  const runningById = new Map<string, ToolInvocation>();
  const runningByTool = new Map<string, ToolInvocation[]>();

  for (const ev of chronological) {
    const tool = ev.tool || ev.event_type;
    const status = statusFromEvent(ev);

    if (ev.event_type === 'tool_start' && ev.tool) {
      const inv: ToolInvocation = {
        id: ev.id,
        tool: ev.tool,
        eventType: ev.event_type,
        status: 'running',
        startTime: ev.timestamp,
        detail: ev.detail,
        skill: ev.skill,
        input: ev.input,
        output: undefined,
      };
      invocations.push(inv);
      runningById.set(ev.id, inv);
      if (!runningByTool.has(ev.tool)) runningByTool.set(ev.tool, []);
      runningByTool.get(ev.tool)!.push(inv);
      continue;
    }

    if (ev.event_type === 'tool_end') {
      let inv: ToolInvocation | undefined;

      if (runningById.has(ev.id)) {
        inv = runningById.get(ev.id);
        runningById.delete(ev.id);
        const stack = runningByTool.get(inv!.tool);
        if (stack) {
          const idx = stack.lastIndexOf(inv!);
          if (idx !== -1) stack.splice(idx, 1);
        }
      } else if (ev.tool) {
        const stack = runningByTool.get(ev.tool);
        if (stack && stack.length) {
          inv = stack.pop();
        }
      }

      if (inv) {
        inv.status = status;
        inv.endTime = ev.timestamp;
        inv.durationMs = ev.duration_ms;
        inv.output = ev.output;
        inv.detail = ev.detail || inv.detail;
        inv.skill = ev.skill || inv.skill;
        continue;
      }

      invocations.push({
        id: ev.id,
        tool: ev.tool || ev.event_type,
        eventType: ev.event_type,
        status,
        startTime: ev.timestamp,
        endTime: ev.timestamp,
        durationMs: ev.duration_ms,
        detail: ev.detail,
        skill: ev.skill,
        input: ev.input,
        output: ev.output,
      });
      continue;
    }

    invocations.push({
      id: ev.id,
      tool,
      eventType: ev.event_type,
      status,
      startTime: ev.timestamp,
      endTime: ev.timestamp,
      durationMs: ev.duration_ms,
      detail: ev.detail,
      skill: ev.skill,
      input: ev.input,
      output: ev.output,
      meta: true,
    });
  }

  const recent = invocations.slice(-MAX_EVENTS);
  recent.reverse();
  return recent;
}

export function buildFileActivity(
  invocations: ToolInvocation[],
  resolvePathFn: (input?: unknown, output?: unknown) => string | undefined
): FileEntry[] {
  const files = new Map<string, FileEntry>();

  for (const inv of invocations) {
    const path = resolvePathFn(inv.input, inv.output);
    if (!path) continue;

    if (!files.has(path)) {
      files.set(path, { path, ops: [] });
    }
    const entry = files.get(path)!;
    const snippetCandidates = [
      inv.output?.diff,
      inv.output?.contentSnippet,
      inv.output?.content,
      inv.output?.result,
      inv.output?.snippet,
      inv.output?.output
    ];
    let resolvedSnippet: string | undefined;
    for (const cand of snippetCandidates) {
      if (typeof cand === 'string' && cand.length > 0) {
        resolvedSnippet = cand;
        break;
      }
    }

    let lineHint: string | undefined;
    if (inv.input) {
      const startLine = inv.input.StartLine ?? inv.input.startLine ?? inv.input.Startline ?? inv.input.line ?? inv.input.Line;
      const endLine = inv.input.EndLine ?? inv.input.endLine ?? inv.input.Endline;
      if (startLine !== undefined) {
        lineHint = endLine !== undefined ? `Lines ${startLine}-${endLine}` : `Line ${startLine}`;
      }
    }

    entry.ops.push({
      id: inv.id,
      type: operationType(inv.tool),
      status: inv.status,
      timestamp: inv.startTime,
      tool: inv.tool,
      snippet: resolvedSnippet,
      skill: inv.skill,
      input: inv.input,
      output: inv.output,
      lineHint,
    });
  }

  return Array.from(files.values()).map((entry) => {
    entry.ops.sort((a, b) => a.timestamp - b.timestamp);
    let snippet: string | undefined;
    for (const op of entry.ops) {
      if (op.snippet) snippet = op.snippet;
    }
    entry.snippet = snippet;
    return entry;
  });
}
