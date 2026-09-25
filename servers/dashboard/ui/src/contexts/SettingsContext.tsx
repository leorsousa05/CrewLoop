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

export function resolveTheme(theme: Theme, prefersLight: boolean): 'dark' | 'light' {
  if (theme !== 'system') return theme;
  return prefersLight ? 'light' : 'dark';
}

export function effectiveReducedMotion(manual: boolean, system: boolean): boolean {
  return manual || system;
}

function usePrefersLightTheme(): boolean {
  const [prefersLight, setPrefersLight] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    setPrefersLight(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersLight(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  return prefersLight;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<DashboardSettings>(() => loadSettings());
  const systemReducedMotion = useReducedMotion();
  const prefersLightTheme = usePrefersLightTheme();
  const resolvedTheme = useMemo(
    () => resolveTheme(settings.theme, prefersLightTheme),
    [settings.theme, prefersLightTheme]
  );
  const reducedMotion = effectiveReducedMotion(settings.reducedMotion, systemReducedMotion);

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

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
    document.documentElement.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
  }, [reducedMotion]);

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
