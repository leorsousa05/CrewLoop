import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TopBar } from './TopBar';

vi.mock('../contexts/SettingsContext', () => ({
  useSettings: () => ({ resolvedTheme: 'dark', setSettings: vi.fn() }),
}));

const baseProps = {
  sessions: [],
  selectedSessionId: null,
  activeSessionId: undefined,
  connection: 'connected' as const,
  onSelectSession: vi.fn(),
  onOpenCommandPalette: vi.fn(),
  onToggleSidebar: vi.fn(),
};

describe('TopBar Usage context', () => {
  it('hides the session selector only on the aggregate Usage view', () => {
    const usage = renderToStaticMarkup(<TopBar {...baseProps} activeView="usage" />);
    const overview = renderToStaticMarkup(<TopBar {...baseProps} activeView="overview" />);
    expect(usage).not.toContain('No session');
    expect(overview).toContain('No session');
    expect(usage).toContain('Usage');
  });
});
