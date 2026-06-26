import type { ClientEvent } from '../types';

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
  const t = tool.toLowerCase();
  if (t === 'read') return 'read';
  if (['write', 'edit', 'editfile'].includes(t)) return 'edit';
  return 'other';
}

export function projectInvocations(events: ClientEvent[]): ToolInvocation[] {
  const chronological = events.slice().reverse();
  const invocations: ToolInvocation[] = [];
  const running = new Map<string, ToolInvocation[]>();

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
      if (!running.has(ev.tool)) running.set(ev.tool, []);
      running.get(ev.tool)!.push(inv);
      continue;
    }

    if (ev.event_type === 'tool_end' && ev.tool) {
      const stack = running.get(ev.tool);
      if (stack && stack.length) {
        const inv = stack.pop()!;
        inv.status = status;
        inv.endTime = ev.timestamp;
        inv.durationMs = ev.duration_ms;
        inv.output = ev.output;
        inv.detail = ev.detail || inv.detail;
        continue;
      }
      invocations.push({
        id: ev.id,
        tool: ev.tool,
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
    entry.ops.push({
      id: inv.id,
      type: operationType(inv.tool),
      status: inv.status,
      timestamp: inv.startTime,
      tool: inv.tool,
      snippet: (inv.output?.diff as string | undefined) || (inv.output?.contentSnippet as string | undefined),
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
