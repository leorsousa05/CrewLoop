import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ToolInvocation } from '../../../src/lib/invocations';
import { TimelineRow } from './TimelineRow';
import { Sidebar } from './Sidebar';
import { SessionSelector } from './SessionSelector';
import { FilterBar } from './FilterBar';
import { getFocusableElements, nextFocusableIndex } from '../hooks/useFocusTrap';

vi.mock('../contexts/FilterContext', () => ({
  useFilters: () => ({
    filters: {
      query: '',
      sources: [],
      skills: [],
      statuses: [],
      tools: [],
      opTypes: [],
      timeRange: 'all',
    },
    setFilters: vi.fn(),
    resetFilters: vi.fn(),
  }),
}));

vi.mock('../hooks/useViewport', () => ({
  useViewport: () => ({ width: 390, breakpoint: 'mobile' }),
}));

const invocation: ToolInvocation = {
  id: 'inv-1',
  tool: 'Read',
  eventType: 'tool_end',
  status: 'success',
  startTime: 1_700_000_000_000,
  durationMs: 120,
  detail: 'README.md',
};

describe('dashboard accessibility contracts', () => {
  it('wraps focus in both directions and ignores hidden controls', () => {
    expect(nextFocusableIndex(0, 3, true)).toBe(2);
    expect(nextFocusableIndex(2, 3, false)).toBe(0);
    expect(nextFocusableIndex(-1, 0, false)).toBe(-1);

    const visible = { getAttribute: () => null, hasAttribute: () => false };
    const hidden = { getAttribute: (name: string) => (name === 'aria-hidden' ? 'true' : null), hasAttribute: () => false };
    const container = {
      querySelectorAll: () => [visible, hidden],
    } as unknown as HTMLElement;
    expect(getFocusableElements(container)).toEqual([visible]);
  });

  it('keeps timeline primary and copy actions as sibling controls', () => {
    const html = renderToStaticMarkup(
      <TimelineRow
        inv={invocation}
        expanded={false}
        selected={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
        onCopy={vi.fn()}
      />
    );

    expect(html).not.toContain('role="button"');
    expect((html.match(/<button/g) || []).length).toBe(2);
    expect(html).toContain('aria-live="polite"');
  });

  it('does not render the closed mobile navigation drawer', () => {
    const html = renderToStaticMarkup(
      <Sidebar activeView="overview" onChange={vi.fn()} mobileOpen={false} onClose={vi.fn()} />
    );

    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('Main navigation');
  });

  it('exposes session selection as a combobox/listbox relationship', () => {
    const html = renderToStaticMarkup(
      <SessionSelector
        sessions={[]}
        selectedSessionId={null}
        activeSessionId={undefined}
        connection="connected"
        onSelect={vi.fn()}
      />
    );

    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).not.toContain('role="option"');
  });

  it('names the shared filter search input', () => {
    const html = renderToStaticMarkup(
      <FilterBar
        options={{ sources: [], skills: [], statuses: [], tools: [], opTypes: [] }}
        resultCount={0}
      />
    );

    expect(html).toContain('id="filter-search"');
    expect(html).toContain('aria-label="Filter events"');
  });
});
