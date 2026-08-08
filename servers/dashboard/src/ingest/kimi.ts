import http from 'node:http';
import { URL } from 'node:url';

const DEFAULT_SERVER_URL = 'http://127.0.0.1:7890';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasUsage(value: Record<string, unknown>): value is Record<string, unknown> & { usage: unknown } {
  return isPlainObject(value.usage);
}

export interface IngestKimiOptions {
  serverUrl?: string;
  stdin?: NodeJS.ReadStream;
  stderr?: NodeJS.WriteStream;
}

export function runIngestKimi(options: IngestKimiOptions = {}): void {
  const stdin = options.stdin || process.stdin;
  const stderr = options.stderr || process.stderr;

  let raw = '';
  stdin.setEncoding('utf8');
  stdin.on('data', (chunk) => {
    raw += chunk;
  });
  stdin.on('end', () => {
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      stderr.write('error: invalid JSON on stdin\n');
      process.exit(1);
      return;
    }

    if (!isPlainObject(payload)) {
      stderr.write('error: stdin must be a JSON object\n');
      process.exit(1);
      return;
    }

    if (typeof payload.session_id !== 'string' || payload.session_id.length === 0) {
      stderr.write('error: missing or invalid session_id\n');
      process.exit(1);
      return;
    }

    if (!hasUsage(payload)) {
      stderr.write('error: missing usage object\n');
      process.exit(1);
      return;
    }

    const body = JSON.stringify({
      session_id: payload.session_id,
      source: typeof payload.source === 'string' ? payload.source : 'kimi',
      model: typeof payload.model === 'string' ? payload.model : undefined,
      timestamp: typeof payload.timestamp === 'number' ? payload.timestamp : undefined,
      usage: payload.usage,
    });

    const serverUrl = options.serverUrl || process.env.CREWLOOP_DASHBOARD_URL || DEFAULT_SERVER_URL;
    const url = new URL('/ingest/usage', serverUrl);
    let done = false;

    function finish(exitCode: number, message?: string): void {
      if (done) return;
      done = true;
      if (message) {
        stderr.write(message);
      }
      process.exit(exitCode);
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
        const status = res.statusCode || 0;
        if (status >= 200 && status < 300) {
          finish(0);
          return;
        }
        finish(1, `error: ingestion failed with status ${status}\n`);
      }
    );

    req.on('error', () => finish(1, 'error: failed to connect to dashboard\n'));
    req.on('timeout', () => {
      req.destroy();
      finish(1, 'error: connection to dashboard timed out\n');
    });
    req.write(body);
    req.end();
  });
}
