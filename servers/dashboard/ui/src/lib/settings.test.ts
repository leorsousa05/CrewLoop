import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, saveSettings, migrate, SETTINGS_VERSION } from './settings';
import { DEFAULT_SETTINGS } from './types';

const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    length: 0,
  } as Storage;
});

describe('settings', () => {
  it('loads defaults when storage is empty', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('migrates partial settings with defaults', () => {
    expect(migrate({ theme: 'dark' })).toEqual({ ...DEFAULT_SETTINGS, theme: 'dark' });
  });

  it('ignores invalid values during migration', () => {
    expect(
      migrate({ theme: 'purple', density: 'compact', reducedMotion: 'yes', maxEvents: -5 })
    ).toEqual({ ...DEFAULT_SETTINGS, density: 'compact' });
  });

  it('saves and reloads settings', () => {
    const next = { ...DEFAULT_SETTINGS, theme: 'light' as const, density: 'compact' as const };
    saveSettings(next);
    expect(loadSettings()).toEqual(next);
    expect(JSON.parse(store['crewloop-dashboard-settings'])).toEqual({
      version: SETTINGS_VERSION,
      settings: next,
    });
  });

  it('migrates the versioned envelope and rejects unknown versions', () => {
    expect(migrate({ version: SETTINGS_VERSION, settings: { theme: 'light', maxEvents: 50 } })).toEqual({
      ...DEFAULT_SETTINGS,
      theme: 'light',
      maxEvents: 50,
    });
    expect(migrate({ version: SETTINGS_VERSION + 1, settings: { theme: 'light' } })).toEqual(DEFAULT_SETTINGS);
    expect(migrate({ theme: 'dark', maxEvents: 101 })).toEqual({ ...DEFAULT_SETTINGS, theme: 'dark' });
  });

  it('falls back to legacy crewloop-theme key', () => {
    globalThis.localStorage.setItem('crewloop-theme', 'dark');
    expect(loadSettings()).toEqual({ ...DEFAULT_SETTINGS, theme: 'dark' });
  });
});
