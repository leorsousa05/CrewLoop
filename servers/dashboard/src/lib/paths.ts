function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const PATH_KEYS = [
  'file_path',
  'path',
  'filePath',
  'filepath',
  'absolute_path',
  'AbsolutePath',
  'absolutepath',
  'TargetFile',
  'target_file',
  'targetfile',
  'notebook_path',
];

function collectObjectPaths(obj: Record<string, unknown>, paths: string[], seen: Set<string>): void {
  for (const key of PATH_KEYS) {
    const value = obj[key];
    if (typeof value === 'string' && value.length > 0 && !seen.has(value)) {
      seen.add(value);
      paths.push(value);
    }
  }
}

function collectNestedArgumentPaths(
  input: Record<string, unknown>,
  paths: string[],
  seen: Set<string>
): void {
  if (isPlainObject(input.args)) {
    collectObjectPaths(input.args as Record<string, unknown>, paths, seen);
  }
}

function collectOperationPaths(
  value: Record<string, unknown>,
  paths: string[],
  seen: Set<string>
): void {
  if (!Array.isArray(value.operations)) return;
  for (const op of value.operations) {
    if (isPlainObject(op)) {
      collectObjectPaths(op as Record<string, unknown>, paths, seen);
    }
  }
}

export function resolvePaths(input?: unknown, output?: unknown): string[] {
  const paths: string[] = [];
  const seen = new Set<string>();

  if (isPlainObject(input)) {
    collectObjectPaths(input as Record<string, unknown>, paths, seen);
    collectNestedArgumentPaths(input as Record<string, unknown>, paths, seen);
    collectOperationPaths(input as Record<string, unknown>, paths, seen);
  }
  if (isPlainObject(output)) {
    collectObjectPaths(output as Record<string, unknown>, paths, seen);
    collectNestedArgumentPaths(output as Record<string, unknown>, paths, seen);
    collectOperationPaths(output as Record<string, unknown>, paths, seen);
  }

  return paths;
}

export function resolvePath(input?: unknown, output?: unknown): string | undefined {
  return resolvePaths(input, output)[0];
}
