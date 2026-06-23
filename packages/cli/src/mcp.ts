import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

export interface McpInstallOptions {
  dryRun?: boolean;
  force?: boolean;
  /** Python executable name/path. Default: "python3" on Unix, "python" on Windows. */
  pythonCmd?: string;
  /** Directory where the obsidian-mcp wrapper/symlink is placed. Default: <homedir>/.local/bin */
  localBinDir?: string;
}

export interface McpInstallResult {
  /** True if a new install or re-install happened. */
  installed: boolean;
  /** True if the binary was already present and force was false. */
  skipped: boolean;
  /** Absolute path to the exposed binary or wrapper. */
  binaryPath?: string;
  /** Error that did not block skill installation. */
  error?: Error;
}

function defaultPythonCmd(): string {
  return os.platform() === 'win32' ? 'python' : 'python3';
}

function defaultLocalBinDir(): string {
  return path.join(os.homedir(), '.local', 'bin');
}

function venvBinDir(): string {
  return os.platform() === 'win32' ? 'Scripts' : 'bin';
}

function runCommand(cmd: string, args: string[]): void {
  const result = spawnPlatform(cmd, args);

  if (result.error || result.status !== 0) {
    throw result.error || new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

function commandExists(cmd: string): boolean {
  const result = spawnPlatform(cmd, ['--version']);
  return result.status === 0;
}

function spawnPlatform(cmd: string, args: string[]) {
  if (os.platform() === 'win32') {
    return spawnSync('cmd', ['/c', cmd, ...args], { stdio: 'ignore' });
  }
  return spawnSync(cmd, args, { stdio: 'ignore' });
}

function ensureVenv(mcpSourceDir: string, pythonCmd: string, force: boolean): void {
  const venvDir = path.join(mcpSourceDir, '.venv');

  if (force && fs.existsSync(venvDir)) {
    fs.rmSync(venvDir, { recursive: true, force: true });
  }

  if (!fs.existsSync(venvDir)) {
    runCommand(pythonCmd, ['-m', 'venv', venvDir]);
  }
}

function findExecutable(basePath: string): string {
  if (os.platform() !== 'win32') {
    return basePath;
  }

  for (const ext of ['.exe', '.cmd']) {
    const candidate = `${basePath}${ext}`;
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return basePath;
}

function venvPip(mcpSourceDir: string): string {
  const venvDir = path.join(mcpSourceDir, '.venv');
  const basePath = path.join(venvDir, venvBinDir(), 'pip');
  return findExecutable(basePath);
}

function venvBinary(mcpSourceDir: string): string {
  const venvDir = path.join(mcpSourceDir, '.venv');
  const basePath = path.join(venvDir, venvBinDir(), 'obsidian-mcp');
  return findExecutable(basePath);
}

function createWindowsWrapper(binaryPath: string, wrapperPath: string): void {
  const content = `@echo off\r\n"${binaryPath}" %*\r\n`;
  fs.writeFileSync(wrapperPath, content);
}

function exposeBinary(
  mcpSourceDir: string,
  localBinDir: string,
  force: boolean
): { binaryPath: string; created: boolean } {
  fs.mkdirSync(localBinDir, { recursive: true });

  const sourceBinary = venvBinary(mcpSourceDir);
  const isWindows = os.platform() === 'win32';

  if (isWindows) {
    const wrapperPath = path.join(localBinDir, 'obsidian-mcp.cmd');
    const created = force || !fs.existsSync(wrapperPath);

    if (created) {
      createWindowsWrapper(sourceBinary, wrapperPath);
    }

    return { binaryPath: wrapperPath, created };
  }

  const targetBinary = path.join(localBinDir, 'obsidian-mcp');
  const created = force || !fs.existsSync(targetBinary);

  if (created) {
    if (fs.existsSync(targetBinary)) {
      fs.rmSync(targetBinary, { force: true });
    }
    fs.symlinkSync(sourceBinary, targetBinary);
  }

  return { binaryPath: targetBinary, created };
}

export function installMcpServer(
  mcpSourceDir: string,
  options: McpInstallOptions = {}
): McpInstallResult {
  const pythonCmd = options.pythonCmd || defaultPythonCmd();
  const localBinDir = options.localBinDir || defaultLocalBinDir();

  if (!commandExists(pythonCmd)) {
    return {
      installed: false,
      skipped: false,
      error: new Error(`Python not found: ${pythonCmd}`),
    };
  }

  if (options.dryRun) {
    const binaryName = os.platform() === 'win32' ? 'obsidian-mcp.cmd' : 'obsidian-mcp';
    return {
      installed: true,
      skipped: false,
      binaryPath: path.join(localBinDir, binaryName),
    };
  }

  try {
    ensureVenv(mcpSourceDir, pythonCmd, options.force || false);
    const pip = venvPip(mcpSourceDir);
    runCommand(pip, ['install', '-q', '-e', mcpSourceDir]);

    const { binaryPath, created } = exposeBinary(mcpSourceDir, localBinDir, options.force || false);

    return {
      installed: created,
      skipped: !created,
      binaryPath,
    };
  } catch (error) {
    return {
      installed: false,
      skipped: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
