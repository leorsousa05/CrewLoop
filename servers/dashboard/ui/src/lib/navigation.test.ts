import { describe, it, expect } from 'vitest';
import { NAV_ITEMS, getNavItem } from './navigation';

describe('navigation registry', () => {
  it('covers every view exactly once in canonical order', () => {
    const keys = NAV_ITEMS.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(['overview', 'sessions', 'timeline', 'files', 'skills', 'settings']);
  });

  it('has unique digit shortcuts', () => {
    const shortcuts = NAV_ITEMS.map((i) => i.shortcut);
    expect(new Set(shortcuts).size).toBe(shortcuts.length);
    for (const s of shortcuts) expect(s).toMatch(/^[1-6]$/);
  });

  it('getNavItem returns the item for each view', () => {
    for (const item of NAV_ITEMS) {
      expect(getNavItem(item.key)).toBe(item);
    }
  });

  it('every item has an icon and a description', () => {
    for (const item of NAV_ITEMS) {
      expect(item.icon.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
    }
  });
});
