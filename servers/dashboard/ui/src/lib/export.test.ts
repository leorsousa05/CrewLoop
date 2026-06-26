import { describe, it, expect } from 'vitest';
import { toExportableEvent, toJson, filename } from './export';
import type { ToolInvocation } from '../../../src/lib/invocations';

describe('export', () => {
  it('maps an invocation to an exportable event', () => {
    const inv: ToolInvocation = {
      id: 'e1',
      tool: 'Read',
      eventType: 'tool_end',
      status: 'success',
      startTime: 1000,
      skill: 'engineer',
      detail: 'opened file',
      input: { path: 'src/index.ts' },
      durationMs: 50,
    };
    const ev = toExportableEvent(inv);
    expect(ev.id).toBe('e1');
    expect(ev.tool).toBe('Read');
    expect(ev.path).toBe('src/index.ts');
    expect(ev.durationMs).toBe(50);
  });

  it('produces valid JSON', () => {
    const blob = toJson([{ id: 'e1', timestamp: 1, eventType: 'tool_end', status: 'success' }]);
    expect(blob.type).toBe('application/json');
  });

  it('generates a filename with timestamp', () => {
    expect(filename('json')).toMatch(/^crewloop-events-\d{4}-\d{2}-\d{2}-\d{6}\.json$/);
  });
});
