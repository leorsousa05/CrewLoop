import path from 'node:path';
import type { GuardPolicy, GuardRule, GuardDecision, NormalizedGuardEvent } from './guard.types';
import { extractCommand } from './normalize';

function matchGlob(value: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern === '**') return true;

  const escape = (s: string) => s.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexSource = pattern
    .split('**')
    .map((part) =>
      part
        .split('/')
        .map((segment) =>
          segment
            .split('*')
            .map((s) => escape(s))
            .join('[^/]*')
        )
        .join('/')
    )
    .join('.*');

  const regex = new RegExp(`^${regexSource}$`);
  return regex.test(value);
}

function extractPaths(input: Record<string, unknown> | undefined): string[] {
  if (!input) return [];
  const paths: string[] = [];
  const seen = new Set<string>();
  const queue: unknown[] = [input];
  while (queue.length > 0) {
    const current = queue.shift();
    if (typeof current === 'string') {
      if ((path.isAbsolute(current) || current.includes('/') || current.includes('\\')) && !seen.has(current)) {
        paths.push(current);
        seen.add(current);
      }
    } else if (Array.isArray(current)) {
      queue.push(...current);
    } else if (typeof current === 'object' && current !== null) {
      for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        const isPathKey =
          lowerKey.includes('path') ||
          lowerKey === 'file' ||
          lowerKey === 'targetfile' ||
          lowerKey === 'absolutepath';
        if (isPathKey && typeof value === 'string' && !seen.has(value)) {
          paths.push(value);
          seen.add(value);
        } else {
          queue.push(value);
        }
      }
    }
  }
  return paths;
}

function ruleMatches(rule: GuardRule, event: NormalizedGuardEvent): boolean {
  if (rule.tools && rule.tools.length > 0) {
    const eventTool = event.tool;
    const isMatched = rule.tools.some((t) => {
      if (t === eventTool) return true;
      if (t.toLowerCase() === 'bash' && (eventTool === 'run_command' || eventTool === 'bash')) return true;
      if (t === 'run_command' && (eventTool === 'run_command' || eventTool === 'Bash' || eventTool === 'bash')) return true;
      return false;
    });
    if (!isMatched) return false;
  }

  if (rule.commandMatches) {
    const command = extractCommand(event.input);
    if (!command) return false;
    try {
      const regex = new RegExp(rule.commandMatches);
      if (!regex.test(command)) return false;
    } catch {
      return false;
    }
  }

  if (rule.paths && rule.paths.length > 0) {
    const targetPaths = extractPaths(event.input);
    if (targetPaths.length === 0) return false;

    const allowedPatterns = rule.paths.filter((p) => p.startsWith('!'));
    const requiredPatterns = rule.paths.filter((p) => !p.startsWith('!'));

    for (const targetPath of targetPaths) {
      const normalizedTarget = path.normalize(targetPath);

      let matched = false;
      for (const pattern of requiredPatterns) {
        if (matchGlob(normalizedTarget, pattern)) {
          matched = true;
          break;
        }
      }
      if (requiredPatterns.length > 0 && !matched) return false;

      for (const pattern of allowedPatterns) {
        const negated = pattern.slice(1);
        if (matchGlob(normalizedTarget, negated)) return false;
      }
    }
  }

  return true;
}

export function evaluatePolicy(
  policy: GuardPolicy,
  event: NormalizedGuardEvent
): GuardDecision {
  for (const rule of policy.rules) {
    if (ruleMatches(rule, event)) {
      const reasonParts: string[] = [];
      if (rule.tools && rule.tools.length > 0) reasonParts.push(rule.tools.join(', '));
      if (rule.commandMatches) reasonParts.push(`matches /${rule.commandMatches}/`);
      if (rule.paths && rule.paths.length > 0) reasonParts.push(rule.paths.join(', '));

      return {
        action: rule.action,
        rule: rule.name,
        reason: reasonParts.length > 0 ? reasonParts.join('; ') : undefined,
      };
    }
  }

  return { action: policy.defaultAction };
}

export { matchGlob, extractPaths };
