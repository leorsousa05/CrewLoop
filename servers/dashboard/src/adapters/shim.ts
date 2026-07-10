import http from 'node:http';
import type { AgentSource, DashboardEvent } from '../types';
import { normalizeKimi, type KimiHookPayload } from './kimi';
import { normalizeClaude, type ClaudeHookPayload } from './claude';
import { normalizeCodex, type CodexHookPayload } from './codex';
import { normalizeAgy, type AgyHookPayload } from './agy';
import { sanitize, sanitizeToolPayload } from '../filters/sanitize';
import { classifyOperation, extractFileDetail } from '../lib/operations';

export { classifyOperation, extractFileDetail };

const DEFAULT_SERVER_URL = 'http://127.0.0.1:7890';

export function getDefaultSkill(argv: string[]): string | undefined {
  const idx = argv.indexOf('--default-skill');
  if (idx !== -1 && argv[idx + 1]) {
    return argv[idx + 1];
  }
  const env = process.env.CREWLOOP_DEFAULT_SKILL;
  return env || undefined;
}

const KNOWN_SOURCES: ReadonlySet<string> = new Set([
  'kimi',
  'claude',
  'codex',
  'opencode',
  'log-watcher',
  'agy',
]);

export function detectSource(argv: string[]): AgentSource | undefined {
  const arg = argv[2];
  if (arg && KNOWN_SOURCES.has(arg)) {
    return arg as AgentSource;
  }
  const env = process.env.CREWLOOP_DASHBOARD_SOURCE;
  if (env && KNOWN_SOURCES.has(env)) {
    return env as AgentSource;
  }
  return undefined;
}

export function normalizePayload(source: AgentSource, raw: unknown): DashboardEvent | undefined {
  if (typeof raw !== 'object' || raw === null) {
    return undefined;
  }

  const payload = raw as Record<string, unknown>;

  switch (source) {
    case 'kimi':
      return normalizeKimi(payload as unknown as KimiHookPayload);
    case 'claude':
      return normalizeClaude(payload as unknown as ClaudeHookPayload);
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
  defaultSkill?: string
): DashboardEvent | undefined {
  const base = normalizePayload(source, raw);
  if (!base) {
    return undefined;
  }

  if (base.event_type === 'session_start' && defaultSkill) {
    base.skill = defaultSkill;
  } else if (defaultSkill && !base.skill) {
    // Every source gets the default-skill fallback: if the explicit
    // session_start is missed (lazy start), the inference engine can still
    // fall back to this instead of reporting the skill as unknown.
    base.default_skill = defaultSkill;
  }

  const isPost = base.event_type === 'tool_end';
  const rawInput = (base.input || raw.tool_input || raw.toolInput) as
    | Record<string, unknown>
    | undefined;
  const rawOutput = (base.output || raw.tool_response || raw.toolResponse) as
    | Record<string, unknown>
    | undefined;

  const sanitized = sanitize(
    {
      tool_name: base.tool || '',
      tool_input: rawInput,
      tool_response: rawOutput,
    },
    isPost ? 'post' : 'pre'
  );

  const isToolEvent = base.event_type === 'tool_start' || base.event_type === 'tool_end';
  const operationType = isToolEvent && base.tool ? classifyOperation(base.tool) : undefined;
  const fileDetail = isToolEvent ? extractFileDetail(base.tool, rawInput) : undefined;

  return {
    ...base,
    operationType,
    detail: sanitized.detail ?? base.detail ?? fileDetail,
    status: sanitized.status,
    duration_ms: sanitized.duration_ms,
    input: sanitizeToolPayload(base.input),
    output: sanitizeToolPayload(base.output),
    workspacePath: base.workspacePath || (typeof raw.cwd === 'string' ? raw.cwd : undefined) || (typeof raw.workspacePath === 'string' ? raw.workspacePath : undefined) || process.cwd(),
  };
}

export function postEvent(event: DashboardEvent, onDone?: () => void): void {
  const serverUrl = process.env.CREWLOOP_DASHBOARD_URL || DEFAULT_SERVER_URL;
  const body = JSON.stringify(event);

  const url = new URL('/event', serverUrl);
  let done = false;
  function finish(): void {
    if (done) return;
    done = true;
    onDone?.();
  }

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
      res.resume();
      finish();
    }
  );

  req.on('error', finish);
  req.on('timeout', () => {
    req.destroy();
    finish();
  });
  req.write(body);
  req.end();
}

export function runShim(): void {
  const source = detectSource(process.argv);
  if (!source) {
    process.stderr.write('crewloop-shim: unknown source. Use: crewloop-shim <kimi|claude|codex|agy>\n');
    process.exit(1);
  }

  const defaultSkill = getDefaultSkill(process.argv);

  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    raw += chunk;
  });
  process.stdin.on('end', () => {
    try {
      const payload = JSON.parse(raw);
      const event = buildEvent(source, payload, defaultSkill);
      if (event) {
        postEvent(event, () => process.exit(0));
        return;
      }
    } catch {
      // Fail silently so the agent is never blocked.
    }
    process.exit(0);
  });
}
