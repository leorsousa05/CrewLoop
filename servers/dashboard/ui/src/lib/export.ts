import type { ToolInvocation } from '../../../src/lib/invocations';
import { resolvePath } from '../../../src/lib/paths';
import type { ExportableEvent } from './types';

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

export function toJson(events: ExportableEvent[]): Blob {
  return new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
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
