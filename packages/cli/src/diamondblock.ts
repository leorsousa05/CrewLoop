import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export interface DiamondBlockInstallRequest {
  agent?: string;
  dryRun: boolean;
}

export type DiamondBlockCommandStatus =
  | 'ready'
  | 'configured'
  | 'unsupported'
  | 'unavailable'
  | 'failed';

export interface DiamondBlockCommandResult {
  status: DiamondBlockCommandStatus;
  executable?: string;
  agent?: string;
  dryRun: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  error?: Error;
}

export interface DiamondBlockExecution {
  exitCode: number;
  stdout: string;
  stderr: string;
  error?: Error;
}

export type DiamondBlockExecutor = (
  executable: string,
  args: readonly string[]
) => DiamondBlockExecution;

export interface DiamondBlockCommandRunner {
  findExecutable(): string | undefined;
  preflight(request: DiamondBlockInstallRequest): DiamondBlockCommandResult;
  install(request: DiamondBlockInstallRequest): DiamondBlockCommandResult;
}

export interface DiamondBlockRunnerDependencies {
  findOnPath?: (binary: string) => string | undefined;
  execute?: DiamondBlockExecutor;
  timeoutMs?: number;
}

export const DIAMONDBLOCK_BINARIES: readonly string[] = ['diamondblock', 'dblock'];

export const DIAMONDBLOCK_INSTALL_HINT = 'install DiamondBlock: npm i -g diamondblock';

const OUTPUT_LIMIT = 2000;
const SPAWN_MAX_BUFFER = 1024 * 1024;
const SPAWN_TIMEOUT_MS = 10_000;

export function boundDiamondBlockOutput(value: string): string {
  if (value.length <= OUTPUT_LIMIT) return value;
  return `${value.slice(0, OUTPUT_LIMIT)}…`;
}

export function buildDiamondBlockInstallArgs(request: DiamondBlockInstallRequest): string[] {
  const args = ['install'];
  if (request.agent !== undefined) {
    args.push('--target', request.agent);
  }
  if (request.dryRun) {
    args.push('--dry-run');
  }
  return args;
}

function defaultFindOnPath(binary: string): string | undefined {
  const pathEnv = process.env.PATH ?? '';
  const extensions = process.platform === 'win32' ? ['.exe', '.cmd', '.bat', ''] : [''];
  for (const dir of pathEnv.split(path.delimiter)) {
    if (!dir) continue;
    for (const ext of extensions) {
      const candidate = path.join(dir, `${binary}${ext}`);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return undefined;
}

export function createDefaultDiamondBlockExecutor(
  timeoutMs: number = SPAWN_TIMEOUT_MS
): DiamondBlockExecutor {
  return (executable, args) => {
    const result = spawnSync(executable, [...args], {
      shell: false,
      encoding: 'utf8',
      maxBuffer: SPAWN_MAX_BUFFER,
      timeout: timeoutMs,
    });
    const stderr = typeof result.stderr === 'string' ? result.stderr : '';
    return {
      exitCode: typeof result.status === 'number' ? result.status : 1,
      stdout: typeof result.stdout === 'string' ? result.stdout : '',
      stderr: stderr || (result.error ? result.error.message : ''),
      error: result.error,
    };
  };
}

export function createDiamondBlockCommandRunner(
  deps: DiamondBlockRunnerDependencies = {}
): DiamondBlockCommandRunner {
  const findOnPath = deps.findOnPath ?? defaultFindOnPath;
  const execute = deps.execute ?? createDefaultDiamondBlockExecutor(deps.timeoutMs);

  function findExecutable(): string | undefined {
    for (const binary of DIAMONDBLOCK_BINARIES) {
      const found = findOnPath(binary);
      if (found) return found;
    }
    return undefined;
  }

  function unavailable(request: DiamondBlockInstallRequest): DiamondBlockCommandResult {
    return {
      status: 'unavailable',
      agent: request.agent,
      dryRun: request.dryRun,
      exitCode: 1,
      stdout: '',
      stderr: `diamondblock executable not found on PATH (tried: ${DIAMONDBLOCK_BINARIES.join(', ')}); ${DIAMONDBLOCK_INSTALL_HINT}`,
    };
  }

  function run(
    request: DiamondBlockInstallRequest,
    successStatus: 'ready' | 'configured',
    failureStatus: 'unsupported' | 'failed'
  ): DiamondBlockCommandResult {
    const executable = findExecutable();
    if (!executable) {
      return unavailable(request);
    }
    const execution = execute(executable, buildDiamondBlockInstallArgs(request));
    return {
      status: execution.exitCode === 0 ? successStatus : failureStatus,
      executable,
      agent: request.agent,
      dryRun: request.dryRun,
      exitCode: execution.exitCode,
      stdout: boundDiamondBlockOutput(execution.stdout),
      stderr: boundDiamondBlockOutput(execution.stderr),
      error: execution.error,
    };
  }

  return {
    findExecutable,
    preflight(request) {
      return run({ ...request, dryRun: true }, 'ready', 'unsupported');
    },
    install(request) {
      return run(request, 'configured', 'failed');
    },
  };
}

export function formatDiamondBlockInstallResult(result: DiamondBlockCommandResult): string {
  const lines = [`diamondblock: ${result.status}`];
  const stdout = result.stdout.trim();
  const stderr = result.stderr.trim();
  if (stdout) lines.push(`diamondblock stdout: ${stdout}`);
  if (stderr) lines.push(`diamondblock stderr: ${stderr}`);
  return lines.join('\n');
}
