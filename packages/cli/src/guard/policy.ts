import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parse } from 'yaml';
import type { GuardPolicy, GuardRule, GuardAction, GuardMode } from './guard.types';

export const DEFAULT_POLICY: GuardPolicy = {
  version: 1,
  mode: 'audit',
  defaultAction: 'allow',
  rules: [],
};

const GLOBAL_POLICY_PATH = path.join(os.homedir(), '.crewloop', 'guard.yml');
const WORKSPACE_POLICY_NAME = '.crewloop';
const WORKSPACE_POLICY_FILE = 'guard.yml';

function findWorkspacePolicy(startDir: string): string | undefined {
  let dir = path.resolve(startDir);
  const root = path.parse(dir).root;
  while (dir !== root) {
    const candidate = path.join(dir, WORKSPACE_POLICY_NAME, WORKSPACE_POLICY_FILE);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    dir = path.dirname(dir);
  }
  return undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidAction(value: unknown): value is GuardAction {
  return value === 'allow' || value === 'block';
}

function isValidMode(value: unknown): value is GuardMode {
  return value === 'block' || value === 'audit';
}

function validateRule(raw: unknown): GuardRule | undefined {
  if (!isPlainObject(raw)) return undefined;
  if (typeof raw.name !== 'string' || raw.name.length === 0) return undefined;
  if (!isValidAction(raw.action)) return undefined;

  const rule: GuardRule = {
    name: raw.name,
    action: raw.action,
  };

  if (raw.tools !== undefined) {
    if (!Array.isArray(raw.tools) || raw.tools.some((t) => typeof t !== 'string')) return undefined;
    rule.tools = raw.tools as string[];
  }

  if (raw.commandMatches !== undefined) {
    if (typeof raw.commandMatches !== 'string') return undefined;
    rule.commandMatches = raw.commandMatches;
  }

  if (raw.paths !== undefined) {
    if (!Array.isArray(raw.paths) || raw.paths.some((p) => typeof p !== 'string')) return undefined;
    rule.paths = raw.paths as string[];
  }

  return rule;
}

function validatePolicy(raw: unknown): GuardPolicy | undefined {
  if (!isPlainObject(raw)) return undefined;

  const version = typeof raw.version === 'number' ? raw.version : 1;
  const mode = isValidMode(raw.mode) ? raw.mode : DEFAULT_POLICY.mode;
  const defaultAction = isValidAction(raw.defaultAction)
    ? raw.defaultAction
    : DEFAULT_POLICY.defaultAction;

  const rules: GuardRule[] = [];
  if (Array.isArray(raw.rules)) {
    for (const r of raw.rules) {
      const validated = validateRule(r);
      if (validated) {
        rules.push(validated);
      }
    }
  }

  return { version, mode, defaultAction, rules };
}

function loadPolicyFile(filePath: string): GuardPolicy | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parse(content);
    return validatePolicy(parsed) ?? undefined;
  } catch {
    return undefined;
  }
}

export interface LoadPolicyOptions {
  cwd?: string;
}

export function loadPolicy(options: LoadPolicyOptions = {}): GuardPolicy {
  const global = loadPolicyFile(GLOBAL_POLICY_PATH);
  const workspacePath = options.cwd ? findWorkspacePolicy(options.cwd) : undefined;
  const workspace = workspacePath ? loadPolicyFile(workspacePath) : undefined;

  const base = global ?? DEFAULT_POLICY;
  if (!workspace) return base;

  const mergedRules: GuardRule[] = [...base.rules];
  const ruleIndex = new Map(mergedRules.map((r, i) => [r.name, i]));
  for (const rule of workspace.rules) {
    const idx = ruleIndex.get(rule.name);
    if (idx !== undefined) {
      mergedRules[idx] = rule;
    } else {
      mergedRules.push(rule);
      ruleIndex.set(rule.name, mergedRules.length - 1);
    }
  }

  return {
    version: workspace.version ?? base.version,
    mode: workspace.mode ?? base.mode,
    defaultAction: workspace.defaultAction ?? base.defaultAction,
    rules: mergedRules,
  };
}

export { GLOBAL_POLICY_PATH };
