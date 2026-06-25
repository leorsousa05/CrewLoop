import http from 'node:http';
import type { AgentSource, DashboardEvent } from '../types';
import { normalizeKimi, type KimiHookPayload } from './kimi';
import { normalizeCodex, type CodexHookPayload } from './codex';
import { sanitize } from '../filters/sanitize';

const DEFAULT_SERVER_URL = 'http://127.0.0.1:7890';

export function detectSource(argv: string[]): AgentSource | undefined {
  const arg = argv[2];
  if (arg === 'kimi' || arg === 'codex' || arg === 'opencode' || arg === 'log-watcher') {
    return arg;
  }
  const env = process.env.CREWLOOP_DASHBOARD_SOURCE;
  if (
    env === 'kimi' ||
    env === 'codex' ||
    env === 'opencode' ||
    env === 'log-watcher'
  ) {
    return env;
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
    case 'codex':
      return normalizeCodex(payload as unknown as CodexHookPayload);
    default:
      return undefined;
  }
}

export function buildEvent(
  source: AgentSource,
  raw: Record<string, unknown>
): DashboardEvent | undefined {
  const base = normalizePayload(source, raw);
  if (!base) {
    return undefined;
  }

  const isPost = base.event_type === 'tool_end';
  const sanitized = sanitize(
    {
      tool_name: base.tool || '',
      tool_input: (raw.tool_input || raw.toolInput) as Record<string, unknown> | undefined,
      tool_response: (raw.tool_response || raw.toolResponse) as Record<string, unknown> | undefined,
    },
    isPost ? 'post' : 'pre'
  );

  return {
    ...base,
    detail: sanitized.detail,
    status: sanitized.status,
    duration_ms: sanitized.duration_ms,
  };
}

export function postEvent(event: DashboardEvent): void {
  const serverUrl = process.env.CREWLOOP_DASHBOARD_URL || DEFAULT_SERVER_URL;
  const body = JSON.stringify(event);

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
    () => {}
  );

  req.on('error', () => {});
  req.on('timeout', () => req.destroy());
  req.write(body);
  req.end();
}

export function runShim(): void {
  const source = detectSource(process.argv);
  if (!source) {
    process.stderr.write('crewloop-shim: unknown source. Use: crewloop-shim <kimi|codex>\n');
    process.exit(1);
  }

  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    raw += chunk;
  });
  process.stdin.on('end', () => {
    try {
      const payload = JSON.parse(raw);
      const event = buildEvent(source, payload);
      if (event) {
        postEvent(event);
      }
    } catch {
      // Fail silently so the agent is never blocked.
    }
    process.exit(0);
  });
}
