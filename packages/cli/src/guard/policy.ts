import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parse, stringify } from 'yaml';
import type { GuardPolicy, GuardRule, GuardAction, GuardMode } from './guard.types';

export const DEFAULT_POLICY: GuardPolicy = {
  version: 1,
  mode: 'audit',
  defaultAction: 'allow',
  confirmationTimeout: 300000,
  rules: [
    {
      name: 'confirm git push',
      action: 'confirm',
      tools: ['Bash', 'run_command'],
      commandMatches: '^git\\s+push',
      confirmationTimeout: 300000,
    },
    {
      name: 'confirm git force push',
      action: 'confirm',
      tools: ['Bash', 'run_command'],
      commandMatches: '^git\\s+push.*--force',
      confirmationTimeout: 300000,
    },
  ],
};

const GLOBAL_POLICY_PATH = path.join(os.homedir(), '.crewloop', 'guard.yml');
const WORKSPACE_POLICY_NAME = '.crewloop';
const WORKSPACE_POLICY_FILE = 'guard.yml';
const WORKSPACE_CONFIRMATIONS_FILE = 'confirmations.yml';

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

function findWorkspaceConfirmations(startDir: string): string | undefined {
  let dir = path.resolve(startDir);
  const root = path.parse(dir).root;
  while (dir !== root) {
    const candidate = path.join(dir, WORKSPACE_POLICY_NAME, WORKSPACE_CONFIRMATIONS_FILE);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    dir = path.dirname(dir);
  }
  return undefined;
}

export function loadRememberedConfirmations(startDir?: string): Set<string> {
  const remembered = new Set<string>();
  if (!startDir) return remembered;

  const confPath = findWorkspaceConfirmations(startDir);
  if (!confPath || !fs.existsSync(confPath)) return remembered;

  try {
    const content = fs.readFileSync(confPath, 'utf8');
    const parsed = parse(content);
    if (isPlainObject(parsed) && Array.isArray(parsed.remembered_rules)) {
      for (const r of parsed.remembered_rules) {
        if (typeof r === 'string') {
          remembered.add(r);
        }
      }
    }
  } catch {
    // Ignore invalid confirmations file
  }

  return remembered;
}

export function saveRememberedConfirmation(cwd: string, ruleName: string): void {
  if (!ruleName) return;

  const crewloopDir = path.join(path.resolve(cwd), WORKSPACE_POLICY_NAME);
  if (!fs.existsSync(crewloopDir)) {
    fs.mkdirSync(crewloopDir, { recursive: true });
  }

  const confPath = path.join(crewloopDir, WORKSPACE_CONFIRMATIONS_FILE);
  const remembered = loadRememberedConfirmations(cwd);
  remembered.add(ruleName);

  const doc = {
    version: 1,
    remembered_rules: Array.from(remembered),
  };

  fs.writeFileSync(confPath, stringify(doc), 'utf8');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidAction(value: unknown): value is GuardAction {
  return value === 'allow' || value === 'block' || value === 'confirm';
}

function isValidConfirmationTimeout(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
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

  if (raw.confirmationTimeout !== undefined) {
    if (!isValidConfirmationTimeout(raw.confirmationTimeout)) return undefined;
    rule.confirmationTimeout = raw.confirmationTimeout;
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

  const policy: GuardPolicy = { version, mode, defaultAction, rules: [] };

  if (raw.confirmationTimeout !== undefined) {
    if (!isValidConfirmationTimeout(raw.confirmationTimeout)) return undefined;
    policy.confirmationTimeout = raw.confirmationTimeout;
  }

  const rules: GuardRule[] = [];
  if (Array.isArray(raw.rules)) {
    for (const r of raw.rules) {
      const validated = validateRule(r);
      if (validated) {
        rules.push(validated);
      }
    }
  }

  policy.rules = rules;
  return policy;
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

export function ensureGlobalPolicy(dryRun?: boolean): string {
  const globalDir = path.dirname(GLOBAL_POLICY_PATH);
  if (!dryRun && !fs.existsSync(globalDir)) {
    fs.mkdirSync(globalDir, { recursive: true });
  }
  if (!fs.existsSync(GLOBAL_POLICY_PATH)) {
    if (!dryRun) {
      fs.writeFileSync(GLOBAL_POLICY_PATH, stringify(DEFAULT_POLICY), 'utf8');
    }
  }
  return GLOBAL_POLICY_PATH;
}

export function loadPolicy(options: LoadPolicyOptions = {}): GuardPolicy {
  ensureGlobalPolicy();
  const global = loadPolicyFile(GLOBAL_POLICY_PATH);
  const workspacePath = options.cwd ? findWorkspacePolicy(options.cwd) : undefined;
  const workspace = workspacePath ? loadPolicyFile(workspacePath) : undefined;

  const base = global ?? DEFAULT_POLICY;
  const remembered = loadRememberedConfirmations(options.cwd);
  if (!workspace && remembered.size === 0) return base;

  const mergedRules: GuardRule[] = [...base.rules];

  if (workspace) {
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
  }

  const finalRules = mergedRules.map((r) => {
    if (remembered.has(r.name)) {
      return { ...r, action: 'allow' as GuardAction };
    }
    return r;
  });

  const policy: GuardPolicy = {
    version: workspace?.version ?? base.version,
    mode: workspace?.mode ?? base.mode,
    defaultAction: workspace?.defaultAction ?? base.defaultAction,
    rules: finalRules,
  };

  const confirmationTimeout = workspace?.confirmationTimeout ?? base.confirmationTimeout;
  if (confirmationTimeout !== undefined) {
    policy.confirmationTimeout = confirmationTimeout;
  }

  return policy;
}

export { GLOBAL_POLICY_PATH };

