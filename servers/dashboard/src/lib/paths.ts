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

function pathFromObject(obj: Record<string, unknown>): string | undefined {
  for (const key of PATH_KEYS) {
    const value = obj[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function firstOperationPath(operations: unknown): string | undefined {
  if (!Array.isArray(operations)) return undefined;
  for (const op of operations) {
    if (isPlainObject(op)) {
      const p = pathFromObject(op);
      if (p) return p;
    }
  }
  return undefined;
}

export function resolvePath(input?: unknown, output?: unknown): string | undefined {
  if (isPlainObject(input)) {
    const p = pathFromObject(input);
    if (p) return p;
    if (isPlainObject(input.args)) {
      const ap = pathFromObject(input.args);
      if (ap) return ap;
    }
    const op = firstOperationPath(input.operations);
    if (op) return op;
  }
  if (isPlainObject(output)) {
    const p = pathFromObject(output);
    if (p) return p;
    if (isPlainObject(output.args)) {
      const ap = pathFromObject(output.args);
      if (ap) return ap;
    }
    const op = firstOperationPath(output.operations);
    if (op) return op;
  }
  return undefined;
}
