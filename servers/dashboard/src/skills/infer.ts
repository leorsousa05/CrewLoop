import type { DashboardEvent, Session, SkillInferenceResult, SkillMeta } from '../types';
import { inferFromGitCommand } from './mapping';

export class SkillInferenceEngine {
  private skillNames: Set<string>;

  constructor(skills: SkillMeta[]) {
    this.skillNames = new Set(skills.map((skill) => skill.name));
  }

  infer(event: DashboardEvent, session: Session): SkillInferenceResult {
    const explicitSignal =
      (event.event_type === 'skill_change' && event.skill) ||
      (event.tool === 'Skill' && event.detail && this.normalizeSkillName(event.detail));

    if (session.active_confidence === 'explicit' && !explicitSignal) {
      return { skill: session.active_skill, confidence: 'explicit' };
    }

    if (event.event_type === 'skill_change' && event.skill) {
      return { skill: event.skill, confidence: 'explicit' };
    }

    if (event.tool === 'Skill' && event.detail) {
      const skill = this.normalizeSkillName(event.detail);
      if (skill) {
        return { skill, confidence: 'explicit' };
      }
    }

    if (event.tool === 'Bash' && event.detail) {
      const gitSkill = inferFromGitCommand(event.detail);
      if (gitSkill) {
        return { skill: gitSkill, confidence: 'heuristic' };
      }
    }

    if (session.active_skill && this.skillNames.has(session.active_skill)) {
      return { skill: session.active_skill, confidence: 'heuristic' };
    }

    return { skill: undefined, confidence: 'unknown' };
  }

  private normalizeSkillName(raw: string): string | undefined {
    const normalized = raw.toLowerCase().trim();
    for (const name of this.skillNames) {
      if (name.toLowerCase() === normalized) {
        return name;
      }
    }
    return undefined;
  }
}
