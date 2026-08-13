import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
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

// Keys preserved verbatim inside tool input/output payloads so the UI can
// render diffs, snippets, and file paths. Values are still subject to
// length/base64 truncation.
export const SAFE_PAYLOAD_KEYS = new Set([
  'path',
  'file_path',
  'filepath',
  'absolutepath',
  'targetfile',
  'notebook_path',
  'content',
  'contentsnippet',
  'result',
  'diff',
  'snippet',
  'old_string',
  'new_string',
  'oldstring',
  'newstring',
  'query',
  'pattern',
  'url',
  'skill',
  'subagent_type',
  'operations',
]);

// Keys recursively removed from tool input/output payloads before storage
// and broadcast: raw credentials, tokens, and other secret material.
export const DANGEROUS_PAYLOAD_KEYS = new Set([
  'api_key',
  'apikey',
  'token',
  'tokens',
  'access_token',
  'refresh_token',
  'session_token',
  'id_token',
  'password',
  'passwd',
  'secret',
  'secrets',
  'authorization',
  'auth',
  'credential',
  'credentials',
  'private_key',
  'privatekey',
  'ssh_key',
  'bearer',
  'cookie',
  'cookies',
]);

// Payload string values longer than this are truncated.
export const MAX_PAYLOAD_STRING_LENGTH = 8000;
// Base64-looking strings longer than this are truncated (likely binaries).
export const MAX_BASE64_STRING_LENGTH = 512;
// Recursion guard for payload sanitization.
export const MAX_PAYLOAD_DEPTH = 8;

export const DEFAULT_PORT = 7890;
export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_MAX_EVENTS = 200;
export const DEFAULT_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_SESSION_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
export const DEFAULT_PRUNE_INTERVAL_MS = 60 * 1000;
export const DEFAULT_EVENT_BODY_BYTES = 256 * 1024;
export const DEFAULT_FILE_BYTES = 1024 * 1024;
export const DEFAULT_WORKSPACE_ENTRIES = 20000;
export const DEFAULT_WORKSPACE_DEPTH = 30;
export const DEFAULT_TELEMETRY_DB_PATH = path.join(
  os.homedir(),
  '.crewloop',
  'dashboard',
  'telemetry.sqlite'
);

export function resolveTelemetryTimeZone(value?: string): string {
  const candidate = value?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(0);
  } catch {
    throw new Error('CREWLOOP_TELEMETRY_TIME_ZONE must be a valid IANA time zone.');
  }
  return candidate;
}

export function resolveTelemetryDbPath(value?: string): string {
  const candidate = value?.trim();
  if (!candidate) return DEFAULT_TELEMETRY_DB_PATH;
  if (candidate.includes('\0')) {
    throw new Error('CREWLOOP_TELEMETRY_DB_PATH contains an invalid character.');
  }
  return path.resolve(candidate);
}

export function resolveKimiDataDir(): string | undefined {
  const env = process.env.KIMI_DATA_DIR;
  if (env) {
    return env.split(',')[0].trim();
  }
  const home = os.homedir();
  const primary = path.join(home, '.kimi-code');
  if (fs.existsSync(primary)) {
    return primary;
  }
  const legacy = path.join(home, '.kimi');
  return fs.existsSync(legacy) ? legacy : undefined;
}

export function loadConfig(): ServerConfig {
  const port = parseInt(process.env.CREWLOOP_DASHBOARD_PORT || String(DEFAULT_PORT), 10);
  const host = process.env.CREWLOOP_DASHBOARD_HOST || DEFAULT_HOST;
  const idleTimeout = parseInt(
    process.env.CREWLOOP_SESSION_IDLE_TIMEOUT_MS || String(DEFAULT_SESSION_IDLE_TIMEOUT_MS),
    10
  );

  return {
    port,
    host,
    packageRoot: resolvePackageRoot(),
    kimiDataDir: resolveKimiDataDir(),
    maxEventsPerSession: DEFAULT_MAX_EVENTS,
    sessionMaxAgeMs: DEFAULT_SESSION_MAX_AGE_MS,
    sessionIdleTimeoutMs: Number.isFinite(idleTimeout) && idleTimeout > 0 ? idleTimeout : DEFAULT_SESSION_IDLE_TIMEOUT_MS,
    pruneIntervalMs: DEFAULT_PRUNE_INTERVAL_MS,
    eventBodyBytes: DEFAULT_EVENT_BODY_BYTES,
    fileBytes: DEFAULT_FILE_BYTES,
    workspaceEntries: DEFAULT_WORKSPACE_ENTRIES,
    workspaceDepth: DEFAULT_WORKSPACE_DEPTH,
    telemetryDbPath: resolveTelemetryDbPath(process.env.CREWLOOP_TELEMETRY_DB_PATH),
    telemetryTimeZone: resolveTelemetryTimeZone(process.env.CREWLOOP_TELEMETRY_TIME_ZONE),
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
  // The default entry skill is `crewloop:plan`, stored in `skills/crewloop-plan`.
  if (fs.existsSync(path.join(monorepoRoot, 'skills', 'crewloop-plan', 'SKILL.md'))) {
    return monorepoRoot;
  }

  throw new Error(
    'Could not find CrewLoop skills package. Install @archznn/crewloop-skills or run from the CrewLoop repository.'
  );
}
