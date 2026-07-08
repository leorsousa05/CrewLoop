import type { DashboardEvent, Session, SkillInferenceResult, SkillMeta } from '../types';
import { inferFromGitCommand } from './mapping';
import { classifyOperation } from '../lib/operations';

const SKILL_TOOL_NAMES = new Set(['skill', 'use_skill', 'useskill']);
const SKILL_FILE_RE = /([^\\/]+)[\\/]SKILL\.md$/i;

/**
 * Infers the active skill for a session from an incoming event.
 *
 * Fallback priority:
 * 1. Direct invocation — a Skill/use_skill tool call naming the skill.
 * 2. Skill file read — a read tool touching a `<skill>/SKILL.md` path.
 * 3. Session metadata — the session's currently active skill.
 * 4. Default configuration — the event's `default_skill`.
 * 5. Unknown — only when everything above fails.
 */
export class SkillInferenceEngine {
  private skillNames: Set<string>;

  constructor(skills: SkillMeta[]) {
    this.skillNames = new Set(skills.map((skill) => skill.name));
  }

  infer(event: DashboardEvent, session: Session): SkillInferenceResult {
    const explicitSignal =
      (event.event_type === 'skill_change' && event.skill) ||
      this.skillFromInvocation(event);

    if (session.active_confidence === 'explicit' && !explicitSignal) {
      return { skill: session.active_skill, confidence: 'explicit' };
    }

    if (event.event_type === 'skill_change' && event.skill) {
      return { skill: event.skill, confidence: 'explicit' };
    }

    // 1. Direct invocation of the Skill tool.
    const invoked = this.skillFromInvocation(event);
    if (invoked) {
      return { skill: invoked, confidence: 'explicit' };
    }

    // 2. Read of a skill definition file (`<skill>/SKILL.md`).
    const fromRead = this.skillFromSkillFileRead(event);
    if (fromRead) {
      return { skill: fromRead, confidence: 'heuristic' };
    }

    if (event.tool === 'Bash' && event.detail) {
      const gitSkill = inferFromGitCommand(event.detail);
      if (gitSkill) {
        return { skill: gitSkill, confidence: 'heuristic' };
      }
    }

    // 3. Session metadata: keep the previously active skill.
    if (session.active_skill && this.skillNames.has(session.active_skill)) {
      return { skill: session.active_skill, confidence: 'heuristic' };
    }

    // 4. Configured default skill.
    if (event.default_skill && this.skillNames.has(event.default_skill)) {
      return { skill: event.default_skill, confidence: 'heuristic' };
    }

    // 5. Nothing matched.
    return { skill: undefined, confidence: 'unknown' };
  }

  private skillFromInvocation(event: DashboardEvent): string | undefined {
    if (!event.tool || !SKILL_TOOL_NAMES.has(event.tool.toLowerCase())) {
      return undefined;
    }

    const candidates: unknown[] = [
      event.input?.skill,
      event.input?.name,
      event.input?.skill_name,
      event.detail,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === 'string') {
        const skill = this.normalizeSkillName(candidate);
        if (skill) {
          return skill;
        }
      }
    }
    return undefined;
  }

  private skillFromSkillFileRead(event: DashboardEvent): string | undefined {
    if (!event.tool || classifyOperation(event.tool) !== 'read') {
      return undefined;
    }

    const candidates: unknown[] = [
      event.detail,
      event.input?.path,
      event.input?.file_path,
      event.input?.filePath,
      event.input?.AbsolutePath,
    ];
    for (const candidate of candidates) {
      if (typeof candidate !== 'string') {
        continue;
      }
      const match = candidate.match(SKILL_FILE_RE);
      if (match) {
        return this.normalizeSkillName(match[1]) ?? match[1];
      }
    }
    return undefined;
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
