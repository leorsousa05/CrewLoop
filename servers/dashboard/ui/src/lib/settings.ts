import type { DashboardSettings, Theme, Density } from './types';
import { DEFAULT_SETTINGS } from './types';

const STORAGE_KEY = 'crewloop-dashboard-settings';
const LEGACY_THEME_KEY = 'crewloop-theme';
export const SETTINGS_VERSION = 1;
export const MIN_MAX_EVENTS = 10;
export const MAX_MAX_EVENTS = 100;

function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light' || value === 'system';
}

function isDensity(value: unknown): value is Density {
  return value === 'compact' || value === 'comfortable';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= MIN_MAX_EVENTS &&
    value <= MAX_MAX_EVENTS
  );
}

export function migrate(partial: unknown): DashboardSettings {
  const next = { ...DEFAULT_SETTINGS };
  if (partial && typeof partial === 'object') {
    const raw = partial as Record<string, unknown>;
    const p = 'version' in raw
      ? raw.version === SETTINGS_VERSION && raw.settings && typeof raw.settings === 'object'
        ? raw.settings as Record<string, unknown>
        : {}
      : raw;
    if (isTheme(p.theme)) next.theme = p.theme;
    if (isDensity(p.density)) next.density = p.density;
    if (isBoolean(p.reducedMotion)) next.reducedMotion = p.reducedMotion;
    if (isBoolean(p.autoFollowActive)) next.autoFollowActive = p.autoFollowActive;
    if (isPositiveInteger(p.maxEvents)) next.maxEvents = p.maxEvents;
  }
  return next;
}

export function loadSettings(): DashboardSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
    const legacy = localStorage.getItem(LEGACY_THEME_KEY) as Theme | null;
    if (legacy && isTheme(legacy)) {
      return { ...DEFAULT_SETTINGS, theme: legacy };
    }
  } catch {
    // Ignore corrupted storage.
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: DashboardSettings): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SETTINGS_VERSION, settings: migrate(settings) })
    );
  } catch {
    // Ignore private-mode or quota errors.
  }
}
