import fs from 'node:fs';
import path from 'node:path';

export interface SkillManifest {
  name: string;
  description: string;
  sourcePath: string;
}

function parseFrontmatter(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!content.startsWith('---')) {
    return result;
  }

  const end = content.indexOf('---', 3);
  if (end === -1) {
    return result;
  }

  const frontmatter = content.slice(3, end).trim();
  for (const line of frontmatter.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
    result[key] = value;
  }

  return result;
}

export function resolveSkills(packageRoot: string, filters?: string[]): SkillManifest[] {
  const skillsDir = path.join(packageRoot, 'skills');
  if (!fs.existsSync(skillsDir)) {
    throw new Error(`Skills directory not found: ${skillsDir}`);
  }

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const skills: SkillManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillName = entry.name;
    if (filters && filters.length > 0 && !filters.includes(skillName)) {
      continue;
    }

    const skillFile = path.join(skillsDir, skillName, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    const content = fs.readFileSync(skillFile, 'utf-8');
    const frontmatter = parseFrontmatter(content);

    skills.push({
      name: skillName,
      description: frontmatter.description || '',
      sourcePath: path.join(skillsDir, skillName),
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}
