import path from 'node:path';
import fs from 'node:fs';
import type { ServerConfig } from './types';

export const SAFE_TOOL_INPUT_KEYS = new Set([
  'path',
  'file_path',
  'skill',
  'subagent_type',
  'url',
]);

export const DANGEROUS_TOOL_INPUT_KEYS = new Set([
  'command',
  'content',
  'text',
  'code',
  'prompt',
  'api_key',
  'token',
  'password',
  'secret',
  'key',
  'authorization',
]);

export const DEFAULT_PORT = 7890;
export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_MAX_EVENTS = 200;
export const DEFAULT_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_PRUNE_INTERVAL_MS = 60 * 1000;

export function loadConfig(): ServerConfig {
  const port = parseInt(process.env.CREWLOOP_DASHBOARD_PORT || String(DEFAULT_PORT), 10);
  const host = process.env.CREWLOOP_DASHBOARD_HOST || DEFAULT_HOST;

  return {
    port,
    host,
    packageRoot: resolvePackageRoot(),
    maxEventsPerSession: DEFAULT_MAX_EVENTS,
    sessionMaxAgeMs: DEFAULT_SESSION_MAX_AGE_MS,
    pruneIntervalMs: DEFAULT_PRUNE_INTERVAL_MS,
  };
}

export function resolvePackageRoot(): string {
  try {
    const skillsPackageJson = require.resolve('@archznn/crewloop-skills/package.json');
    return path.dirname(skillsPackageJson);
  } catch {
    const cwdNodeModules = path.join(process.cwd(), 'node_modules', '@archznn', 'crewloop-skills');
    if (fs.existsSync(path.join(cwdNodeModules, 'package.json'))) {
      return cwdNodeModules;
    }
  }

  const monorepoRoot = path.resolve(__dirname, '..', '..', '..');
  if (fs.existsSync(path.join(monorepoRoot, 'skills', 'orchestrator', 'SKILL.md'))) {
    return monorepoRoot;
  }

  throw new Error(
    'Could not find CrewLoop skills package. Install @archznn/crewloop-skills or run from the CrewLoop repository.'
  );
}
