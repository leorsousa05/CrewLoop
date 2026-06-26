import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { AgentSource, DashboardEvent, EventType } from '../types';
import { normalizeKimi, type KimiHookPayload } from './kimi';
import { normalizeCodex, type CodexHookPayload } from './codex';
import { normalizeAgy, type AgyHookPayload } from './agy';
import { sanitize, type SanitizedToolData } from '../filters/sanitize';

const DEFAULT_SERVER_URL = 'http://127.0.0.1:7890';

function getDebugLogPath(argv: string[]): string | undefined {
  const idx = argv.indexOf('--debug');
  if (idx !== -1) {
    const next = argv[idx + 1];
    if (next && !next.startsWith('--')) {
      return next;
    }
    return process.env.CREWLOOP_SHIM_LOG || path.join(os.homedir(), '.gemini', 'crewloop-shim.log');
  }
  return process.env.CREWLOOP_SHIM_LOG || undefined;
}

function logDebug(logPath: string | undefined, entry: Record<string, unknown>): void {
  if (!logPath) return;
  try {
    const line = JSON.stringify(
      { time: new Date().toISOString(), ...entry },
      null,
      2
    );
    fs.appendFileSync(logPath, `${line}\n---\n`);
  } catch {
    // Never block the agent because of logging failures.
  }
}

export function getDefaultSkill(argv: string[]): string | undefined {
  const idx = argv.indexOf('--default-skill');
  if (idx !== -1 && argv[idx + 1]) {
    return argv[idx + 1];
  }
  const env = process.env.CREWLOOP_DEFAULT_SKILL;
  return env || undefined;
}

const VALID_EVENT_OVERRIDES: EventType[] = [
  'session_start',
  'session_end',
  'tool_start',
  'tool_end',
  'skill_change',
];

export function detectSource(argv: string[]): AgentSource | undefined {
  const arg = argv[2];
  if (arg === 'kimi' || arg === 'codex' || arg === 'agy' || arg === 'opencode' || arg === 'log-watcher') {
    return arg;
  }
  const env = process.env.CREWLOOP_DASHBOARD_SOURCE;
  if (
    env === 'kimi' ||
    env === 'codex' ||
    env === 'agy' ||
    env === 'opencode' ||
    env === 'log-watcher'
  ) {
    return env;
  }
  return undefined;
}

export function getEventTypeOverride(argv: string[]): EventType | undefined {
  const idx = argv.indexOf('--event-type');
  if (idx === -1) return undefined;
  const value = argv[idx + 1];
  if (!value) return undefined;
  return VALID_EVENT_OVERRIDES.includes(value as EventType) ? (value as EventType) : undefined;
}

export function normalizePayload(source: AgentSource, raw: unknown): DashboardEvent | undefined {
  if (typeof raw !== 'object' || raw === null) {
    return undefined;
  }

  const payload = raw as Record<string, unknown>;

  switch (source) {
    case 'kimi':
      return normalizeKimi(payload as unknown as KimiHookPayload);
    case 'codex':
      return normalizeCodex(payload as unknown as CodexHookPayload);
    case 'agy':
      return normalizeAgy(payload as unknown as AgyHookPayload);
    default:
      return undefined;
  }
}

export function buildEvent(
  source: AgentSource,
  raw: Record<string, unknown>,
  defaultSkill?: string,
  eventTypeOverride?: EventType
): DashboardEvent | undefined {
  const base = normalizePayload(source, raw);
  if (!base) {
    return undefined;
  }

  if (eventTypeOverride) {
    base.event_type = eventTypeOverride;
  }

  if (defaultSkill) {
    base.default_skill = defaultSkill;
    if (base.event_type === 'session_start') {
      base.skill = defaultSkill;
    }
  }

  const isPost = base.event_type === 'tool_end';
  const sanitized: SanitizedToolData = sanitize(
    {
      tool_name: base.tool || '',
      tool_input: (raw.tool_input || raw.toolInput) as Record<string, unknown> | undefined,
      tool_response: (raw.tool_response || raw.toolResponse || raw.tool_output || raw.toolOutput) as Record<string, unknown> | undefined,
    },
    isPost ? 'post' : 'pre'
  );

  return {
    ...base,
    detail: sanitized.detail,
    status: sanitized.status,
    duration_ms: sanitized.duration_ms,
    input: sanitized.input,
    output: sanitized.output,
  };
}

export function postEvent(
  event: DashboardEvent,
  logPath?: string,
  onDone?: () => void
): void {
  const serverUrl = process.env.CREWLOOP_DASHBOARD_URL || DEFAULT_SERVER_URL;
  const body = JSON.stringify(event);

  logDebug(logPath, { stage: 'post', serverUrl, body });

  const url = new URL('/event', serverUrl);
  const req = http.request(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 300,
    },
    (res) => {
      logDebug(logPath, { stage: 'response', statusCode: res.statusCode });
      onDone?.();
    }
  );

  req.on('error', (err) => {
    logDebug(logPath, { stage: 'error', message: err.message });
    onDone?.();
  });
  req.on('timeout', () => {
    logDebug(logPath, { stage: 'timeout' });
    req.destroy();
    onDone?.();
  });
  req.write(body);
  req.end();
}

export function runShim(): void {
  const source = detectSource(process.argv);
  const logPath = getDebugLogPath(process.argv);

  logDebug(logPath, { stage: 'start', argv: process.argv, source });

  if (!source) {
    logDebug(logPath, { stage: 'error', message: 'unknown source' });
    process.stderr.write('crewloop-shim: unknown source. Use: crewloop-shim <kimi|codex|agy|opencode|log-watcher>\n');
    process.exit(1);
  }

  const defaultSkill = getDefaultSkill(process.argv);
  const eventTypeOverride = getEventTypeOverride(process.argv);

  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    raw += chunk;
  });
  process.stdin.on('end', () => {
    logDebug(logPath, { stage: 'stdin', raw });
    try {
      const payload = JSON.parse(raw);
      const event = buildEvent(source, payload, defaultSkill, eventTypeOverride);
      logDebug(logPath, { stage: 'event', event });
      if (event) {
        postEvent(event, logPath, () => process.exit(0));
        return;
      }
    } catch (err) {
      logDebug(logPath, { stage: 'error', message: err instanceof Error ? err.message : String(err) });
      // Fail silently so the agent is never blocked.
    }
    process.exit(0);
  });
}
