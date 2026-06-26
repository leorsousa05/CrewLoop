import { useEffect } from 'react';

interface ShortcutOptions {
  meta?: boolean;
  ctrl?: boolean;
  preventDefault?: boolean;
  disabled?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: ShortcutOptions = {}
): void {
  const { meta = false, ctrl = false, preventDefault = true, disabled = false } = options;

  useEffect(() => {
    if (disabled) return;

    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (meta && !(e.metaKey || e.ctrlKey)) return;
      if (ctrl && !e.ctrlKey) return;
      if (!meta && !ctrl && (e.metaKey || e.ctrlKey)) return;

      if (preventDefault) e.preventDefault();
      callback();
    }

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [key, callback, meta, ctrl, preventDefault, disabled]);
}
