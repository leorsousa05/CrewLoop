import { describe, expect, it } from 'vitest';
import { effectiveReducedMotion, resolveTheme } from './SettingsContext';

describe('settings runtime preferences', () => {
  it('resolves system theme from the current media-query preference', () => {
    expect(resolveTheme('system', true)).toBe('light');
    expect(resolveTheme('system', false)).toBe('dark');
    expect(resolveTheme('dark', true)).toBe('dark');
  });

  it('lets either manual or system reduced motion disable motion', () => {
    expect(effectiveReducedMotion(false, false)).toBe(false);
    expect(effectiveReducedMotion(true, false)).toBe(true);
    expect(effectiveReducedMotion(false, true)).toBe(true);
  });
});
