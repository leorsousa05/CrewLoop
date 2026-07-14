import type { View } from './types';

export interface NavItem {
  key: View;
  label: string;
  icon: string;
  shortcut: string;
  description: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'overview', label: 'Overview', icon: 'House', shortcut: '1', description: 'Live session command center' },
  { key: 'sessions', label: 'Sessions', icon: 'Rows', shortcut: '2', description: 'All agent sessions' },
  { key: 'timeline', label: 'Timeline', icon: 'Clock', shortcut: '3', description: 'Tool invocation stream' },
  { key: 'files', label: 'Files', icon: 'Files', shortcut: '4', description: 'File activity and diffs' },
  { key: 'skills', label: 'Skills', icon: 'ChartPie', shortcut: '5', description: 'Skill and tool rankings' },
  { key: 'settings', label: 'Settings', icon: 'Gear', shortcut: '6', description: 'Appearance and behavior' },
];

export function getNavItem(view: View): NavItem {
  const item = NAV_ITEMS.find((i) => i.key === view);
  if (!item) throw new Error(`Unknown view: ${view}`);
  return item;
}
