import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { CliOptions } from '../args';
import { listSupportedAgents } from '../agents';
import { resolveSkills } from '../resolver';
import {
  createDiamondBlockCommandRunner,
  DIAMONDBLOCK_INSTALL_HINT,
  type DiamondBlockExecutor,
} from '../diamondblock';

export type DoctorLevel = 'ok' | 'warn' | 'error';

export interface DoctorCheckResult {
  level: DoctorLevel;
  label: string;
  detail: string;
}

export interface DoctorReport {
  checks: DoctorCheckResult[];
  exitCode: 0 | 1;
}

export interface DoctorContext {
  packageRoot?: string;
  resolvePackageRoot?: () => string;
  homeDir?: string;
  exists?: (path: string) => boolean;
  readFile?: (path: string) => string;
  resolveModule?: (id: string, fromDir: string) => boolean;
  findOnPath?: (binary: string) => string | undefined;
  executeCommand?: DiamondBlockExecutor;
}

function defaultExists(target: string): boolean {
  return fs.existsSync(target);
}

function defaultReadFile(target: string): string {
  return fs.readFileSync(target, 'utf8');
}

function defaultResolveModule(id: string, fromDir: string): boolean {
  try {
    require.resolve(id, { paths: [fromDir] });
    return true;
  } catch {
    return false;
  }
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

interface ResolvedDoctorContext {
  packageRoot?: string;
  rootError?: Error;
  homeDir: string;
  exists: (path: string) => boolean;
  readFile: (path: string) => string;
  resolveModule: (id: string, fromDir: string) => boolean;
  findOnPath: (binary: string) => string | undefined;
  executeCommand?: DiamondBlockExecutor;
}

function resolveContext(context: DoctorContext): ResolvedDoctorContext {
  let packageRoot = context.packageRoot;
  let rootError: Error | undefined;

  if (!packageRoot) {
    const resolveRoot = context.resolvePackageRoot ?? (() => {
      throw new Error('package root unavailable');
    });
    try {
      packageRoot = resolveRoot();
    } catch (error) {
      rootError = error instanceof Error ? error : new Error(String(error));
    }
  }

  return {
    packageRoot,
    rootError,
    homeDir: context.homeDir ?? os.homedir(),
    exists: context.exists ?? defaultExists,
    readFile: context.readFile ?? defaultReadFile,
    resolveModule: context.resolveModule ?? defaultResolveModule,
    findOnPath: context.findOnPath ?? defaultFindOnPath,
    executeCommand: context.executeCommand,
  };
}

function agentConfigPath(configPath: string, homeDir: string): string {
  const realHome = os.homedir();
  if (configPath.startsWith(realHome)) {
    return path.join(homeDir, configPath.slice(realHome.length));
  }
  return configPath;
}

function checkDashboardDeps(root: string, ctx: ResolvedDoctorContext): DoctorCheckResult {
  const pkgPath = path.join(root, 'servers', 'dashboard', 'package.json');
  if (!ctx.exists(pkgPath)) {
    return { level: 'error', label: 'dashboard', detail: 'package.json not found' };
  }
  try {
    const pkg = JSON.parse(ctx.readFile(pkgPath)) as { dependencies?: Record<string, string> };
    const dashboardDir = path.dirname(pkgPath);
    const missing = Object.keys(pkg.dependencies ?? {}).filter(
      (dep) => !ctx.resolveModule(dep, dashboardDir)
    );
    if (missing.length > 0) {
      return { level: 'error', label: 'dashboard', detail: `missing dependencies: ${missing.join(', ')}` };
    }
    return { level: 'ok', label: 'dashboard', detail: 'dependencies resolved' };
  } catch (error) {
    return { level: 'error', label: 'dashboard', detail: (error as Error).message };
  }
}

export function runDoctor(context: DoctorContext): DoctorReport {
  const ctx = resolveContext(context);
  const checks: DoctorCheckResult[] = [];
  const root = ctx.packageRoot;

  if (ctx.rootError || !root) {
    checks.push({
      level: 'error',
      label: 'package root',
      detail: ctx.rootError?.message ?? 'unavailable',
    });
    const skippedChecks = [
      { label: 'skills', detail: 'skipped: package root unavailable' },
      { label: 'shim', detail: 'skipped: package root unavailable' },
      { label: 'dashboard', detail: 'skipped: package root unavailable' },
      { label: 'dashboard', detail: 'dependencies skipped: package root unavailable' },
    ];
    for (const check of skippedChecks) {
      checks.push({ level: 'error', ...check });
    }
  } else {
    checks.push({ level: 'ok', label: 'package root', detail: root });

    try {
      const skills = resolveSkills(root);
      if (skills.length === 0) {
        checks.push({ level: 'error', label: 'skills', detail: 'no skills found' });
      } else {
        checks.push({ level: 'ok', label: 'skills', detail: `${skills.length} found` });
      }
    } catch (error) {
      checks.push({ level: 'error', label: 'skills', detail: (error as Error).message });
    }

    const shimBin = path.join(root, 'servers', 'dashboard', 'bin', 'crewloop-shim.js');
    checks.push(
      ctx.exists(shimBin)
        ? { level: 'ok', label: 'shim', detail: shimBin }
        : { level: 'error', label: 'shim', detail: `not found: ${shimBin}` }
    );

    const dashboardBin = path.join(root, 'servers', 'dashboard', 'bin', 'crewloop-dashboard.js');
    checks.push(
      ctx.exists(dashboardBin)
        ? { level: 'ok', label: 'dashboard', detail: dashboardBin }
        : { level: 'error', label: 'dashboard', detail: `not found: ${dashboardBin}` }
    );

    checks.push(checkDashboardDeps(root, ctx));
  }

  const shimOnPath = ctx.findOnPath('crewloop-shim');
  checks.push(
    shimOnPath
      ? { level: 'ok', label: 'shim', detail: 'crewloop-shim found on PATH' }
      : {
          level: 'warn',
          label: 'shim',
          detail: 'crewloop-shim not found on PATH (npm install -g @archznn/crewloop-skills)',
        }
  );

  for (const agent of listSupportedAgents()) {
    if (!agent.hooks.supported) continue;
    const label = 'hooks';
    const configPath = agentConfigPath(agent.hooks.configPath, ctx.homeDir);
    if (!ctx.exists(configPath)) {
      checks.push({ level: 'warn', label, detail: `${agent.id} not present` });
      continue;
    }
    try {
      const content = ctx.readFile(configPath);
      const present = content.includes('crewloop-shim') || content.includes('CREWLOOP-PLUGIN');
      checks.push(present
        ? { level: 'ok', label, detail: `${agent.id} present` }
        : { level: 'warn', label, detail: `${agent.id} not present` });
    } catch {
      checks.push({ level: 'warn', label, detail: `${agent.id} unreadable` });
    }
  }

  const diamondblockSkillAgents = listSupportedAgents()
    .filter((agent) =>
      ctx.exists(
        path.join(agentConfigPath(agent.skillsDir, ctx.homeDir), 'diamondblock', 'SKILL.md')
      )
    )
    .map((agent) => agent.id);
  checks.push(
    diamondblockSkillAgents.length > 0
      ? {
          level: 'ok',
          label: 'diamondblock skill',
          detail: `installed for: ${diamondblockSkillAgents.join(', ')}`,
        }
      : {
          level: 'warn',
          label: 'diamondblock skill',
          detail: 'not installed for any supported agent (run crewloop install)',
        }
  );

  const diamondblockRunner = createDiamondBlockCommandRunner({
    findOnPath: ctx.findOnPath,
    execute: ctx.executeCommand,
  });
  const diamondblockExecutable = diamondblockRunner.findExecutable();
  checks.push(
    diamondblockExecutable
      ? { level: 'ok', label: 'diamondblock binary', detail: diamondblockExecutable }
      : {
          level: 'warn',
          label: 'diamondblock binary',
          detail: `not found on PATH (optional; ${DIAMONDBLOCK_INSTALL_HINT})`,
        }
  );

  if (diamondblockExecutable) {
    const preflight = diamondblockRunner.preflight({ dryRun: true });
    checks.push(
      preflight.status === 'ready'
        ? { level: 'ok', label: 'diamondblock installer', detail: 'official installer ready' }
        : {
            level: 'warn',
            label: 'diamondblock installer',
            detail: `official installer preflight ${preflight.status} (exit code ${preflight.exitCode})`,
          }
    );
  }

  checks.push({
    level: 'warn',
    label: 'diamondblock runtime',
    detail: 'verify in agent: expected MCP tools must be exposed',
  });

  const exitCode = checks.some((check) => check.level === 'error') ? 1 : 0;
  return { checks, exitCode };
}

export function runDoctorCommand(
  _options: CliOptions,
  stdout: (line: string) => void,
  stderr: (line: string) => void,
  resolvePackageRoot: () => string
): number {
  const report = runDoctor({ resolvePackageRoot });
  for (const check of report.checks) {
    const line = `${check.level} ${check.label}: ${check.detail}`;
    if (check.level === 'error') {
      stderr(line);
    } else {
      stdout(line);
    }
  }
  return report.exitCode;
}
