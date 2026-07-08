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
    maxEventsPerSession: DEFAULT_MAX_EVENTS,
    sessionMaxAgeMs: DEFAULT_SESSION_MAX_AGE_MS,
    sessionIdleTimeoutMs: Number.isFinite(idleTimeout) && idleTimeout > 0 ? idleTimeout : DEFAULT_SESSION_IDLE_TIMEOUT_MS,
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
  if (fs.existsSync(path.join(monorepoRoot, 'skills', 'crewloop-hub', 'SKILL.md'))) {
    return monorepoRoot;
  }

  throw new Error(
    'Could not find CrewLoop skills package. Install @archznn/crewloop-skills or run from the CrewLoop repository.'
  );
}
