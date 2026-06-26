import { describe, it, expect } from 'vitest';
import { score, search, matchesInvocation } from './search';
import type { CommandPaletteItem, ToolInvocation } from './types';

function item(title: string, subtitle?: string, keywords?: string[]): CommandPaletteItem {
  return { id: title, type: 'view', title, subtitle, keywords, action: () => {} };
}

describe('search', () => {
  it('scores zero when no tokens match', () => {
    expect(score(item('Timeline'), 'files')).toBe(0);
  });

  it('scores positive when all tokens match', () => {
    expect(score(item('Session Overview', 'list all sessions'), 'session list')).toBe(2);
  });

  it('returns ranked results', () => {
    const items = [item('Files'), item('Sessions'), item('Settings')];
    expect(search(items, 'ses').map((i) => i.title)).toEqual(['Sessions']);
  });

  it('matches invocations by tool, detail, skill, and output', () => {
    const inv: ToolInvocation = {
      id: '1',
      tool: 'Read',
      eventType: 'tool_end',
      status: 'success',
      startTime: 0,
      skill: 'engineer',
      detail: 'opened readme',
      output: { contentSnippet: 'hello world' },
    };
    expect(matchesInvocation(inv, 'Read')).toBe(true);
    expect(matchesInvocation(inv, 'engineer')).toBe(true);
    expect(matchesInvocation(inv, 'hello')).toBe(true);
    expect(matchesInvocation(inv, 'missing')).toBe(false);
  });

  it('requires every token to match', () => {
    const inv: ToolInvocation = {
      id: '1',
      tool: 'Edit',
      eventType: 'tool_end',
      status: 'success',
      startTime: 0,
      detail: 'updated config',
    };
    expect(matchesInvocation(inv, 'edit config')).toBe(true);
    expect(matchesInvocation(inv, 'edit missing')).toBe(false);
  });
});
