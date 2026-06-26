import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme !== 'system') return theme;
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('crewloop-theme') as Theme | null;
    return stored || 'system';
  });
  const resolved = resolveTheme(theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(resolved);
  }, [resolved]);

  const setTheme = (value: Theme) => {
    localStorage.setItem('crewloop-theme', value);
    setThemeState(value);
  };

  return { theme, resolved, setTheme };
}
