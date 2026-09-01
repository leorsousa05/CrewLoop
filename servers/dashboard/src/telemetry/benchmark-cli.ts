import fs from 'node:fs';
import {
  compareTokenOptimizationBenchmarks,
  formatBenchmarkMarkdown,
  validateTokenBenchmarkDataset,
} from './benchmark';

export interface BenchmarkCliIO {
  stdout: (value: string) => void;
  stderr: (value: string) => void;
}

interface BenchmarkCliOptions {
  baseline: string;
  candidate: string;
  format: 'json' | 'markdown';
}

function parseArgs(argv: string[]): BenchmarkCliOptions {
  const read = (name: string): string | undefined => {
    const index = argv.indexOf(name);
    return index === -1 ? undefined : argv[index + 1];
  };
  const baseline = read('--baseline');
  const candidate = read('--candidate');
  const format = read('--format') || 'markdown';

  if (!baseline || !candidate) {
    throw new Error('usage: --baseline <file> --candidate <file> [--format json|markdown]');
  }
  if (format !== 'json' && format !== 'markdown') {
    throw new Error('--format must be json or markdown');
  }
  return { baseline, candidate, format };
}

function readDataset(path: string) {
  const raw = fs.readFileSync(path, 'utf8');
  return validateTokenBenchmarkDataset(JSON.parse(raw));
}

export function runBenchmarkCli(
  argv: string[],
  io: BenchmarkCliIO = {
    stdout: (value) => process.stdout.write(value),
    stderr: (value) => process.stderr.write(value),
  }
): number {
  try {
    const options = parseArgs(argv);
    const comparison = compareTokenOptimizationBenchmarks(
      readDataset(options.baseline),
      readDataset(options.candidate)
    );
    io.stdout(
      options.format === 'json'
        ? `${JSON.stringify(comparison, null, 2)}\n`
        : formatBenchmarkMarkdown(comparison)
    );
    return comparison.passed ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid benchmark input';
    io.stderr(`token benchmark: ${message}\n`);
    return 2;
  }
}

if (require.main === module) {
  process.exitCode = runBenchmarkCli(process.argv.slice(2));
}
