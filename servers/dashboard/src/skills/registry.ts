import fs from 'node:fs';
import path from 'node:path';
import type { SkillMeta } from '../types';
import { canonicalSkillName } from '../lib/skills';

const SKILL_ICONS: Record<string, string> = {
  'crewloop:plan': 'blueprint',
  'crewloop:design': 'palette',
  'crewloop:code': 'wrench',
  'crewloop:review': 'magnifying-glass',
  'crewloop:ship': 'rocket-launch',
  'crewloop:docs': 'article',
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
        .map((entry) => {
          const name = canonicalSkillName(entry.name);
          return {
            name,
            description: '',
            icon: SKILL_ICONS[name] || 'circle',
          };
        });
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
