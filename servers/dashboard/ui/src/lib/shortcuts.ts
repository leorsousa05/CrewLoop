export type ShortcutScope = 'global' | 'timeline';

export interface Shortcut {
  keys: string;
  label: string;
  scope: ShortcutScope;
}

export const SHORTCUTS: readonly Shortcut[] = [
  { keys: '⌘K', label: 'Open command palette', scope: 'global' },
  { keys: '1–6', label: 'Switch to view by position', scope: 'global' },
  { keys: '/', label: 'Focus filter search', scope: 'global' },
  { keys: 'Esc', label: 'Close the topmost overlay', scope: 'global' },
  { keys: 'j / k', label: 'Select next / previous row', scope: 'timeline' },
  { keys: 'Enter', label: 'Expand or collapse the selected row', scope: 'timeline' },
  { keys: 'p', label: 'Toggle pause', scope: 'timeline' },
];
