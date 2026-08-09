import http from 'node:http';
import type { GuardPostEvent } from './guard.types';

const DEFAULT_DASHBOARD_URL = 'http://127.0.0.1:7890';
const POST_TIMEOUT_MS = 100;

export function postDecision(event: GuardPostEvent, serverUrl?: string): void {
  const dashboardUrl = serverUrl ?? process.env.CREWLOOP_DASHBOARD_URL ?? DEFAULT_DASHBOARD_URL;
  const body = JSON.stringify(event);

  try {
    const url = new URL('/event', dashboardUrl);
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
        timeout: POST_TIMEOUT_MS,
      },
      (res) => {
        res.resume();
      }
    );

    req.on('error', () => {});
    req.on('timeout', () => {
      req.destroy();
    });
    req.write(body);
    req.end();
  } catch {
    // Never block the agent on telemetry failures.
  }
}
