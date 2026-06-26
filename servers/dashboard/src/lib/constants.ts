export const SKILL_ICONS: Record<string, string> = {
  orchestrator: 'Target',
  architect: 'Blueprint',
  designer: 'Palette',
  engineer: 'Wrench',
  reviewer: 'MagnifyingGlass',
  shipper: 'RocketLaunch',
  'docs-writer': 'Article',
  tester: 'Flask',
  'product-manager': 'ChartBar',
  maintainer: 'Toolbox',
  researcher: 'Microscope',
  'security-guard': 'Shield',
  'accessibility-auditor': 'Person',
  'project-mapper': 'TreeStructure',
  default: 'Circle',
};

export function skillIcon(skillName: string | undefined): string {
  const key = String(skillName || '').toLowerCase().replace(/\s+/g, '-');
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

