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

export type ResolvePaths = (input?: unknown, output?: unknown) => string[];

export function resolveFileSnippet(
  path: string,
  input?: unknown,
  output?: unknown
): string | undefined {
  const inputOperation = resolveOperationDiff(path, input);
  if (inputOperation.matched) {
    return inputOperation.diff;
  }
  const outputOperation = resolveOperationDiff(path, output);
  if (outputOperation.matched) {
    return outputOperation.diff;
  }
  return (
    resolveStringField(output, 'diff') ??
    resolveStringField(output, 'contentSnippet') ??
    resolveStringField(output, 'content') ??
    resolveStringField(output, 'result') ??
    resolveStringField(output, 'snippet') ??
    resolveStringField(output, 'output')
  );
}

interface OperationDiffResolution {
  matched: boolean;
  diff?: string;
}

function resolveOperationDiff(
  path: string,
  payload: unknown
): OperationDiffResolution {
  if (!isPlainObject(payload) || !Array.isArray(payload.operations)) {
    return { matched: false };
  }
  for (const operation of payload.operations) {
    if (!isPlainObject(operation)) {
      continue;
    }
    const operationPath = [operation.path, operation.file_path, operation.filePath]
      .find((value): value is string => typeof value === 'string');
    if (operationPath === path) {
      return {
        matched: true,
        diff: typeof operation.diff === 'string' ? operation.diff : undefined,
      };
    }
  }
  return { matched: false };
}

function resolveStringField(payload: unknown, field: string): string | undefined {
  if (!isPlainObject(payload)) {
    return undefined;
  }
  return typeof payload[field] === 'string' ? payload[field] : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
        inv.input = inv.input && Object.keys(inv.input).length > 0 ? inv.input : ev.input;
        inv.output = ev.output || inv.output;
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
  resolvePathsFn: ResolvePaths
): FileEntry[] {
  const files = new Map<string, FileEntry>();

  for (const inv of invocations) {
    const paths = new Set(resolvePathsFn(inv.input, inv.output));
    for (const path of paths) {
      if (!path) continue;
      if (!files.has(path)) {
        files.set(path, { path, ops: [] });
      }
      const entry = files.get(path)!;
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
        snippet: resolveFileSnippet(path, inv.input, inv.output),
        skill: inv.skill,
        input: inv.input,
        output: inv.output,
        lineHint,
      });
    }
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
