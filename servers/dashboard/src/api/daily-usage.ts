import type { IncomingMessage, ServerResponse } from 'node:http';
import type { TokenUsageRepository } from '../telemetry/usage-repository';
import { formatLocalDate } from '../telemetry/sqlite-usage-repository';

const MAX_RANGE_DAYS = 366;
const ALLOWED_PARAMS = new Set(['from', 'to', 'range']);

export function createDailyUsageHandler(repository: TokenUsageRepository) {
  return (req: IncomingMessage, res: ServerResponse): void => {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(req.url || '', 'http://localhost');
    } catch {
      sendRangeError(res, 'Invalid query');
      return;
    }
    if ([...parsed.searchParams.keys()].some((key) => !ALLOWED_PARAMS.has(key))) {
      sendRangeError(res, 'Unknown query parameter');
      return;
    }

    const range = parsed.searchParams.get('range');
    const explicitFrom = parsed.searchParams.get('from');
    const explicitTo = parsed.searchParams.get('to');
    if (range !== null && range !== 'all') {
      sendRangeError(res, 'Invalid range');
      return;
    }
    if (range === 'all' && (explicitFrom || explicitTo)) {
      sendRangeError(res, 'Range cannot be combined with dates');
      return;
    }

    const today = formatLocalDate(Date.now(), repository.timeZone);
    let from: string;
    let to: string;
    if (range === 'all') {
      from = repository.getOldestUsageDate() ?? today;
      to = today;
    } else if (explicitFrom !== null || explicitTo !== null) {
      if (!explicitFrom || !explicitTo || !isLocalDate(explicitFrom) || !isLocalDate(explicitTo)) {
        sendRangeError(res, 'Both from and to must be valid YYYY-MM-DD dates');
        return;
      }
      from = explicitFrom;
      to = explicitTo;
      if (from > to || inclusiveDays(from, to) > MAX_RANGE_DAYS) {
        sendRangeError(res, 'Date range must be ordered and no longer than 366 days');
        return;
      }
    } else {
      from = shiftLocalDate(today, -29);
      to = today;
    }

    try {
      sendJson(res, 200, repository.queryDaily({ from, to }));
    } catch {
      sendJson(res, 503, { error: 'Usage history unavailable', code: 'USAGE_READ_FAILED' });
    }
  };
}

function sendRangeError(res: ServerResponse, error: string): void {
  sendJson(res, 400, { error, code: 'INVALID_USAGE_RANGE' });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

function isLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function shiftLocalDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function inclusiveDays(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.floor((end - start) / 86_400_000) + 1;
}
