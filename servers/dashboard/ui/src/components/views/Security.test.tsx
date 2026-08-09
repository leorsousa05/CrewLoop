import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ClientSession } from '../../../../src/types';
import { Security } from './Security';

const mockFetch = vi.fn();
(globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch;

function session(overrides: Partial<ClientSession> = {}): ClientSession {
  return {
    id: 's1',
    source: 'kimi',
    lifecycle: 'running',
    events: [],
    startTime: 1000,
    lastActivity: 2000,
    toolCounts: {},
    securityDecisions: [],
    ...overrides,
  };
}

describe('Security', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders empty state when no session is selected', () => {
    const html = renderToStaticMarkup(<Security selectedSession={undefined} />);
    expect(html).toContain('Select a session to view guard decisions.');
  });

  it('renders summary and decisions panel', () => {
    const html = renderToStaticMarkup(
      <Security
        selectedSession={session({
          securityDecisions: [
            { timestamp: 2000, tool: 'Read', decision: 'allow', rule: 'safe-path' },
            { timestamp: 3000, tool: 'Bash', decision: 'block', rule: 'destructive' },
          ],
        })}
      />
    );
    expect(html).toContain('Decisions');
    expect(html).toContain('allow');
    expect(html).toContain('block');
    expect(html).toContain('safe-path');
    expect(html).toContain('destructive');
  });
});
