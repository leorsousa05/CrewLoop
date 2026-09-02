import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SettingsView } from './SettingsView';

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: () => ({
    settings: {
      theme: 'system',
      density: 'comfortable',
      reducedMotion: false,
      autoFollowActive: true,
      maxEvents: 100,
    },
    reducedMotion: false,
    setSettings: vi.fn(),
  }),
}));

describe('Settings accessibility labels', () => {
  it('names the theme, toggle, and numeric controls', () => {
    const html = renderToStaticMarkup(<SettingsView />);

    expect(html).toContain('aria-label="Theme"');
    expect(html).toContain('aria-label="Enable reduced motion"');
    expect(html).toContain('aria-label="Disable auto-follow active session"');
    expect(html).toContain('aria-label="Max events per session"');
  });
});
