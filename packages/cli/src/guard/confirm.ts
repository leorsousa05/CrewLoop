import http from 'node:http';
import { randomUUID } from 'node:crypto';
import type { GuardDecision, GuardPostEvent, NormalizedGuardEvent } from './guard.types';
import { postDecision } from './post';

export const DEFAULT_CONFIRMATION_TIMEOUT_MS = 300000;
export const POLL_INTERVAL_MS = 500;

export interface ConfirmationOptions {
  timeout?: number;
  serverUrl?: string;
}

export interface ConfirmationResult {
  action: 'allow' | 'block';
  remember?: boolean;
}

interface ConfirmationStatusResponse {
  status: 'pending' | 'approved' | 'denied';
  remember?: boolean;
}

export function requestConfirmation(
  event: NormalizedGuardEvent,
  decision: GuardDecision,
  options: ConfirmationOptions = {}
): Promise<ConfirmationResult> {
  const confirmationId = randomUUID();
  const timeout = options.timeout ?? DEFAULT_CONFIRMATION_TIMEOUT_MS;
  const serverUrl = options.serverUrl ?? process.env.CREWLOOP_DASHBOARD_URL ?? 'http://127.0.0.1:7890';

  const postEvent: GuardPostEvent = {
    event_type: 'security_decision',
    source: 'guard',
    session_id: event.session_id,
    tool: event.tool,
    decision: 'pending',
    rule: decision.rule,
    reason: decision.reason,
    workspacePath: event.cwd,
    timestamp: Date.now(),
    confirmationId,
  };

  console.error('[guard] posting pending decision', confirmationId, 'to', serverUrl);
  postDecision(postEvent, serverUrl);

  return pollConfirmationStatus(confirmationId, timeout, serverUrl);
}

function pollConfirmationStatus(
  confirmationId: string,
  timeoutMs: number,
  serverUrl: string
): Promise<ConfirmationResult> {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve) => {
    const poll = () => {
      const now = Date.now();
      if (now >= deadline) {
        resolve({ action: 'block' });
        return;
      }

      fetchConfirmationStatus(confirmationId, serverUrl)
        .then((response) => {
          console.error('[guard] poll response', response);
          if (response.status === 'approved') {
            resolve({ action: 'allow', remember: response.remember });
          } else if (response.status === 'denied') {
            resolve({ action: 'block', remember: response.remember });
          } else {
            scheduleNextPoll(deadline, poll);
          }
        })
        .catch((err) => {
          console.error('[guard] poll error', err.message);
          // Treat polling errors as pending; let the deadline handle timeout.
          scheduleNextPoll(deadline, poll);
        });
    };

    poll();
  });
}

function scheduleNextPoll(deadline: number, poll: () => void): void {
  const remaining = deadline - Date.now();
  setTimeout(poll, Math.min(POLL_INTERVAL_MS, Math.max(0, remaining)));
}

function fetchConfirmationStatus(
  confirmationId: string,
  serverUrl: string
): Promise<ConfirmationStatusResponse> {
  return new Promise((resolve, reject) => {
    let url: URL;
    try {
      url = new URL(`/api/security/confirmations/${encodeURIComponent(confirmationId)}`, serverUrl);
    } catch {
      reject(new Error('invalid server URL'));
      return;
    }

    const req = http.get(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        timeout: POLL_INTERVAL_MS,
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 404) {
            // The dashboard may not have processed the pending event yet, or it
            // may have restarted. Keep polling until the deadline; timeout is fail-closed.
            reject(new Error('confirmation not found'));
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`unexpected status ${res.statusCode}`));
            return;
          }
          try {
            const parsed = JSON.parse(data) as unknown;
            if (!isConfirmationStatusResponse(parsed)) {
              reject(new Error('invalid response shape'));
              return;
            }
            resolve(parsed);
          } catch {
            reject(new Error('invalid JSON'));
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('request timeout'));
    });
  });
}

function isConfirmationStatusResponse(value: unknown): value is ConfirmationStatusResponse {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.status === 'pending' || v.status === 'approved' || v.status === 'denied') &&
    (v.remember === undefined || typeof v.remember === 'boolean')
  );
}
