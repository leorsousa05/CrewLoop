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

    const usesModifier = meta || ctrl;

    function handler(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (meta && !(e.metaKey || e.ctrlKey)) return;
      if (ctrl && !e.ctrlKey) return;
      if (!meta && !ctrl && (e.metaKey || e.ctrlKey)) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? '';
      // Plain-key shortcuts are guarded against form fields; modifier combos
      // (e.g. Cmd/Ctrl+K) must work from any focus target.
      if (!usesModifier && (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable)) {
        return;
      }

      if (preventDefault) e.preventDefault();
      callback();
    }

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [key, callback, meta, ctrl, preventDefault, disabled]);
}
