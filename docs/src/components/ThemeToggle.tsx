import { Moon, Sun } from '@phosphor-icons/react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={!isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`btn-ghost !p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 justify-center ${className ?? ''}`}
    >
      {isDark ? <Moon size={16} weight="regular" /> : <Sun size={16} weight="regular" />}
    </button>
  );
}
