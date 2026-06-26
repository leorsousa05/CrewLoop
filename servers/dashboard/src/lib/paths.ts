function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function firstOperationPath(operations: unknown): string | undefined {
  if (!Array.isArray(operations)) return undefined;
  for (const op of operations) {
    if (isPlainObject(op)) {
      const p = op.path ?? op.file_path;
      if (typeof p === 'string') return p;
    }
  }
  return undefined;
}

export function resolvePath(input?: unknown, output?: unknown): string | undefined {
  const candidates = [
    isPlainObject(input) ? input.path : undefined,
    isPlainObject(input) ? input.file_path : undefined,
    isPlainObject(input) ? input.filePath : undefined,
    isPlainObject(input) && isPlainObject(input.args) ? input.args.path : undefined,
    isPlainObject(input) && isPlainObject(input.args) ? input.args.file_path : undefined,
    isPlainObject(input) && isPlainObject(input.args) ? input.args.filePath : undefined,
    isPlainObject(input) ? firstOperationPath(input.operations) : undefined,
    isPlainObject(output) ? output.path : undefined,
    isPlainObject(output) ? output.file_path : undefined,
    isPlainObject(output) && isPlainObject(output.args) ? output.args.path : undefined,
    isPlainObject(output) && isPlainObject(output.args) ? output.args.file_path : undefined,
    isPlainObject(output) ? firstOperationPath(output.operations) : undefined,
  ];
  for (const p of candidates) {
    if (typeof p === 'string') return p;
  }
  return undefined;
}
