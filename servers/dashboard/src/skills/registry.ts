import fs from 'node:fs';
import path from 'node:path';
import type { SkillMeta } from '../types';

const SKILL_ICONS: Record<string, string> = {
  orchestrator: 'target',
  architect: 'blueprint',
  designer: 'palette',
  engineer: 'wrench',
  reviewer: 'magnifying-glass',
  shipper: 'rocket-launch',
  'docs-writer': 'article',
  tester: 'flask',
  'product-manager': 'chart-bar',
  maintainer: 'toolbox',
  researcher: 'microscope',
  'security-guard': 'shield',
  'accessibility-auditor': 'person',
  'obsidian-second-brain': 'brain',
};

export class SkillRegistry {
  private skills: SkillMeta[] = [];
  private packageRoot: string;

  constructor(packageRoot: string) {
    this.packageRoot = packageRoot;
  }

  load(): SkillMeta[] {
    const skillsDir = path.join(this.packageRoot, 'skills');
    if (fs.existsSync(skillsDir)) {
      this.skills = fs
        .readdirSync(skillsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({
          name: entry.name,
          description: '',
          icon: SKILL_ICONS[entry.name] || 'circle',
        }));
    }

    return this.skills;
  }

  getSkills(): SkillMeta[] {
    if (this.skills.length === 0) {
      this.load();
    }
    return this.skills;
  }

  getIcon(skillName: string): string {
    return SKILL_ICONS[skillName] || 'circle';
  }

  hasSkill(skillName: string): boolean {
    return this.getSkills().some((skill) => skill.name === skillName);
  }
}
