import fs from 'node:fs';
import {
  buildTokenBenchmarkDatasetFromExecutionRecords,
  compareTokenOptimizationBenchmarks,
  formatBenchmarkMarkdown,
  validateTokenBenchmarkDataset,
  type TaskExecutionBenchmarkDatasetInput,
  type TokenBenchmarkDataset,
} from './benchmark';
import type { AgentSource } from '../types';

export interface BenchmarkCliIO {
  stdout: (value: string) => void;
  stderr: (value: string) => void;
}

interface BenchmarkCliOptions {
  mode: 'datasets' | 'records';
  baseline: string;
  candidate: string;
  format: 'json' | 'markdown';
}

function parseArgs(argv: string[]): BenchmarkCliOptions {
  const read = (name: string): string | undefined => {
    const index = argv.indexOf(name);
    const value = index === -1 ? undefined : argv[index + 1];
    return value && !value.startsWith('--') ? value : undefined;
  };
  const baseline = read('--baseline');
  const candidate = read('--candidate');
  const baselineRecords = read('--baseline-records');
  const candidateRecords = read('--candidate-records');
  const format = read('--format') || 'markdown';

  const hasDatasetOption = argv.includes('--baseline') || argv.includes('--candidate');
  const hasRecordOption = argv.includes('--baseline-records') || argv.includes('--candidate-records');
  if (hasDatasetOption === hasRecordOption) {
    throw new Error(
      'usage: --baseline <file> --candidate <file> | --baseline-records <file> --candidate-records <file> [--format json|markdown]'
    );
  }
  if (hasDatasetOption && (!baseline || !candidate)) {
    throw new Error('usage: --baseline <file> --candidate <file> [--format json|markdown]');
  }
  if (hasRecordOption && (!baselineRecords || !candidateRecords)) {
    throw new Error('usage: --baseline-records <file> --candidate-records <file> [--format json|markdown]');
  }
  if (format !== 'json' && format !== 'markdown') {
    throw new Error('--format must be json or markdown');
  }
  return {
    mode: hasRecordOption ? 'records' : 'datasets',
    baseline: (baselineRecords || baseline) as string,
    candidate: (candidateRecords || candidate) as string,
    format,
  };
}

function readDataset(path: string): TokenBenchmarkDataset {
  const raw = fs.readFileSync(path, 'utf8');
  return validateTokenBenchmarkDataset(JSON.parse(raw));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readExecutionDataset(path: string): TokenBenchmarkDataset {
  const raw = fs.readFileSync(path, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (!isObject(parsed)
    || typeof parsed.label !== 'string'
    || !isObject(parsed.policy)
    || typeof parsed.policy.id !== 'string'
    || typeof parsed.policy.version !== 'string'
    || typeof parsed.source !== 'string'
    || !Array.isArray(parsed.records)) {
    throw new Error('execution benchmark input must contain label, policy, source, and records');
  }

  const input: TaskExecutionBenchmarkDatasetInput = {
    label: parsed.label,
    policy: { id: parsed.policy.id, version: parsed.policy.version },
    source: parsed.source as AgentSource,
    records: parsed.records,
  };
  const projection = buildTokenBenchmarkDatasetFromExecutionRecords(input);
  if (projection.status !== 'ready') {
    const details = projection.reason === 'no_records'
      ? projection.reason
      : projection.unavailable.map(({ index, reason }) => `${index}:${reason}`).join(',');
    throw new Error(`execution benchmark input unavailable: ${details}`);
  }
  return projection.dataset;
}

function readBenchmarkInput(path: string, mode: BenchmarkCliOptions['mode']): TokenBenchmarkDataset {
  return mode === 'records' ? readExecutionDataset(path) : readDataset(path);
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
      readBenchmarkInput(options.baseline, options.mode),
      readBenchmarkInput(options.candidate, options.mode)
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
