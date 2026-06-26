import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DashboardSettings, Theme } from '../lib/types';
import { loadSettings, saveSettings } from '../lib/settings';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface SettingsContextValue {
  settings: DashboardSettings;
  resolvedTheme: 'dark' | 'light';
  reducedMotion: boolean;
  setSettings: (updater: DashboardSettings | ((prev: DashboardSettings) => DashboardSettings)) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<DashboardSettings>(() => loadSettings());
  const systemReducedMotion = useReducedMotion();
  const resolvedTheme = useMemo(() => resolveTheme(settings.theme), [settings.theme]);
  const reducedMotion = settings.reducedMotion || systemReducedMotion;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('density-compact', 'density-comfortable');
    root.classList.add(`density-${settings.density}`);
  }, [settings.density]);

  const setSettings = useCallback(
    (updater: DashboardSettings | ((prev: DashboardSettings) => DashboardSettings)) => {
      setSettingsState((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: DashboardSettings) => DashboardSettings)(prev) : updater;
        saveSettings(next);
        return next;
      });
    },
    []
  );

  return (
    <SettingsContext.Provider value={{ settings, resolvedTheme, reducedMotion, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
