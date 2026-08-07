import { canonicalSkillName } from './skills';

export const SKILL_ICONS: Record<string, string> = {
  'crewloop:plan': 'Blueprint',
  'crewloop:design': 'Palette',
  'crewloop:code': 'Wrench',
  'crewloop:review': 'MagnifyingGlass',
  'crewloop:ship': 'RocketLaunch',
  'crewloop:docs': 'Article',
  default: 'Circle',
};

export function skillIcon(skillName: string | undefined): string {
  const key = canonicalSkillName(String(skillName || '').toLowerCase().replace(/\s+/g, '-'));
  return SKILL_ICONS[key] || SKILL_ICONS.default;
}

export function sourceIcon(source: string | undefined): string {
  switch (source) {
    case 'kimi':
      return 'ChatTeardropText';
    case 'codex':
      return 'Terminal';
    case 'opencode':
      return 'CodeBlock';
    case 'log-watcher':
      return 'FileText';
    default:
      return 'Monitor';
  }
}

export const TYPE_COLORS: Record<string, string> = {
  skill: 'var(--accent)',
  tool: 'var(--running)',
  file: 'var(--text-secondary)',
};
