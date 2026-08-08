const DEFAULT_MAX_COMMAND_LENGTH = 1024 * 1024;
const DEFAULT_MAX_PATH_COUNT = 100;
const DEFAULT_MAX_PATH_LENGTH = 1024;
const DEFAULT_MAX_DIFF_LENGTH = 8000;
const DEFAULT_MAX_TOTAL_DIFF_LENGTH = 64 * 1024;
const TRUNCATION_MARKER = '…[truncated]';

const PATCH_HEADER =
  /^\*\*\* (Add File|Update File|Delete File|Move to):[ \t]*(.*)$/;
const PATCH_ENVELOPE = /^\*\*\* (?:Begin|End) Patch[ \t]*$/;
const PATCH_CONTROL_DIRECTIVE = /^\*\*\* /;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const SENSITIVE_NAME =
  /\b(?:api[_-]?key|apikey|secret|token|password|passwd|authorization|private[_-]?key|client[_-]?secret)\b/i;
const OPENAI_CREDENTIAL = /\bsk-[A-Za-z0-9][A-Za-z0-9_-]{7,}\b/i;
const GITHUB_CREDENTIAL =
  /\b(?:gh[pousr]_[A-Za-z0-9]{8,}|github_pat_[A-Za-z0-9_]{8,})\b/i;
const AWS_ACCESS_KEY = /\bAKIA[0-9A-Z]{16}\b/;
const PEM_PRIVATE_KEY = /-----BEGIN [A-Z ]*PRIVATE KEY-----|-----END [A-Z ]*PRIVATE KEY-----/i;
const BEARER_CREDENTIAL = /\bBearer\s+\S+/i;

export interface CodexPatchMetadataOptions {
  maxCommandLength?: number;
  maxPathCount?: number;
  maxPathLength?: number;
  maxDiffLength?: number;
  maxTotalDiffLength?: number;
}

export interface SafeFileOperation {
  path: string;
  diff?: string;
}

export interface CodexPatchMetadata extends Record<string, unknown> {
  operations: SafeFileOperation[];
}

interface ParsedFileOperation {
  path: string;
  diff?: string;
  diffTruncated: boolean;
  sensitive: boolean;
}

export function extractCodexPatchMetadata(
  input: unknown,
  options: CodexPatchMetadataOptions = {}
): CodexPatchMetadata | undefined {
  if (!isPlainObject(input) || typeof input.command !== 'string') {
    return undefined;
  }

  const maxCommandLength = positiveInteger(
    options.maxCommandLength,
    DEFAULT_MAX_COMMAND_LENGTH
  );
  const maxPathCount = positiveInteger(options.maxPathCount, DEFAULT_MAX_PATH_COUNT);
  const maxPathLength = positiveInteger(options.maxPathLength, DEFAULT_MAX_PATH_LENGTH);
  const maxDiffLength = positiveInteger(options.maxDiffLength, DEFAULT_MAX_DIFF_LENGTH);
  const maxTotalDiffLength = positiveInteger(
    options.maxTotalDiffLength,
    DEFAULT_MAX_TOTAL_DIFF_LENGTH
  );
  if (input.command.length > maxCommandLength) {
    return undefined;
  }

  const operations: ParsedFileOperation[] = [];
  const operationsByPath = new Map<string, ParsedFileOperation>();
  let activeOperation: ParsedFileOperation | undefined;

  for (const line of input.command.replace(/\r\n?/g, '\n').split('\n')) {
    const header = PATCH_HEADER.exec(line);
    if (header) {
      const action = header[1];
      const path = header[2].trim();
      if (!isSafePath(path, maxPathLength)) {
        return undefined;
      }

      let operation = operationsByPath.get(path);
      if (!operation) {
        if (operations.length >= maxPathCount) {
          return undefined;
        }
        operation = {
          path,
          diffTruncated: false,
          sensitive: isSensitivePath(path),
        };
        operationsByPath.set(path, operation);
        operations.push(operation);
      }
      activeOperation = operation;
      appendSafeLine(
        operation,
        `*** ${action}: ${path}`,
        maxDiffLength
      );
      continue;
    }

    if (PATCH_ENVELOPE.test(line)) {
      if (line.startsWith('*** End Patch')) {
        activeOperation = undefined;
      }
      continue;
    }
    if (PATCH_CONTROL_DIRECTIVE.test(line)) {
      continue;
    }
    if (!activeOperation) {
      continue;
    }

    appendSafeLine(activeOperation, redactSensitiveLine(line), maxDiffLength);
  }

  if (operations.length === 0) {
    return undefined;
  }

  return {
    operations: applyAggregateBudget(operations, maxTotalDiffLength),
  };
}

function appendSafeLine(
  operation: ParsedFileOperation,
  line: string,
  maxDiffLength: number
): void {
  if (operation.sensitive || operation.diffTruncated) {
    return;
  }
  const candidate = operation.diff ? `${operation.diff}\n${line}` : line;
  if (candidate.length <= maxDiffLength) {
    operation.diff = candidate;
    return;
  }
  operation.diff = truncateOnLineBoundary(candidate, maxDiffLength);
  operation.diffTruncated = true;
}

function applyAggregateBudget(
  parsed: ParsedFileOperation[],
  maxTotalDiffLength: number
): SafeFileOperation[] {
  let remaining = maxTotalDiffLength;
  let exhausted = false;

  return parsed.map((operation) => {
    const safe: SafeFileOperation = { path: operation.path };
    if (!operation.diff || operation.sensitive || exhausted) {
      return safe;
    }
    if (operation.diff.length <= remaining) {
      safe.diff = operation.diff;
      remaining -= operation.diff.length;
      exhausted = remaining === 0;
      return safe;
    }
    if (remaining > 0) {
      safe.diff = truncateOnLineBoundary(operation.diff, remaining);
    }
    exhausted = true;
    return safe;
  });
}

function truncateOnLineBoundary(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }
  if (limit <= TRUNCATION_MARKER.length) {
    return TRUNCATION_MARKER.slice(0, limit);
  }

  const prefixLimit = limit - TRUNCATION_MARKER.length - 1;
  const retained: string[] = [];
  let retainedLength = 0;
  for (const line of value.split('\n')) {
    const nextLength = retainedLength + (retained.length > 0 ? 1 : 0) + line.length;
    if (nextLength > prefixLimit) {
      break;
    }
    retained.push(line);
    retainedLength = nextLength;
  }
  return retained.length > 0
    ? `${retained.join('\n')}\n${TRUNCATION_MARKER}`
    : TRUNCATION_MARKER;
}

function redactSensitiveLine(line: string): string {
  if (
    !SENSITIVE_NAME.test(line) &&
    !OPENAI_CREDENTIAL.test(line) &&
    !GITHUB_CREDENTIAL.test(line) &&
    !AWS_ACCESS_KEY.test(line) &&
    !PEM_PRIVATE_KEY.test(line) &&
    !BEARER_CREDENTIAL.test(line)
  ) {
    return line;
  }
  const prefix = line.startsWith('+') || line.startsWith('-') || line.startsWith(' ')
    ? line[0]
    : '';
  return `${prefix}[redacted sensitive line]`;
}

function isSensitivePath(path: string): boolean {
  const normalized = path.replace(/\\/g, '/').toLowerCase();
  const basename = normalized.split('/').pop() || '';
  return (
    basename === '.env' ||
    basename.startsWith('.env.') ||
    basename.endsWith('.pem') ||
    basename.endsWith('.key') ||
    basename === 'id_rsa' ||
    basename === 'id_ed25519'
  );
}

function isSafePath(path: string, maxPathLength: number): boolean {
  return (
    path.length > 0 &&
    path.length <= maxPathLength &&
    !CONTROL_CHARACTERS.test(path)
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return Number.isInteger(value) && (value as number) > 0 ? (value as number) : fallback;
}
