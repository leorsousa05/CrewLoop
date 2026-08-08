import type { ToolInvocation } from '../../../src/lib/invocations';
import { resolvePath } from '../../../src/lib/paths';
import type { ExportableEvent } from './types';
import type { ClientSession, ClientTokenUsage } from '../../../src/types';

export interface TokenSessionReport {
  schemaVersion: 1;
  sessionId: string;
  source: ClientSession['source'];
  model?: string;
  startedAt: number;
  endedAt?: number;
  durationMs: number;
  toolCalls: number;
  tokenUsage: ClientTokenUsage;
}

export function toExportableEvent(inv: ToolInvocation): ExportableEvent {
  return {
    id: inv.id,
    timestamp: inv.startTime,
    tool: inv.tool,
    eventType: inv.eventType,
    status: inv.status,
    skill: inv.skill,
    detail: inv.detail,
    path: resolvePath(inv.input, inv.output),
    durationMs: inv.durationMs,
  };
}

export function toTokenSessionReport(session: ClientSession): TokenSessionReport {
  const toolEvents = session.events.filter(
    (event) => event.event_type === 'tool_start' || event.event_type === 'tool_end'
  );
  return {
    schemaVersion: 1,
    sessionId: session.id,
    source: session.source,
    model: session.tokenUsage?.model,
    startedAt: session.startTime,
    endedAt: session.endedAt,
    durationMs: Math.max(0, (session.endedAt || session.lastActivity) - session.startTime),
    toolCalls: Math.ceil(toolEvents.length / 2),
    tokenUsage: session.tokenUsage || {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      reasoningTokens: 0,
      totalTokens: 0,
      quality: 'unavailable',
      measurementCount: 0,
      rejectedMeasurementCount: 0,
    },
  };
}

export function toJson(value: unknown): Blob {
  return new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
}

export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function filename(extension: 'json'): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `crewloop-events-${stamp}.${extension}`;
}

export function tokenFilename(sessionId: string): string {
  const safeId = sessionId.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 48) || 'session';
  return `crewloop-token-run-${safeId}.json`;
}
