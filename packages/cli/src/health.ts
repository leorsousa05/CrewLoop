import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { AgentConfig } from './agents';

export interface HealthCheckResult {
  agent: string;
  check: string;
  severity: 'ok' | 'warning' | 'error';
  message: string;
  docUrl?: string;
}

export type AgentHealthCheck = (agent: AgentConfig) => HealthCheckResult[];

const CODEX_SANDBOX_DOC_URL = 'https://github.com/openai/codex/issues/28457';

function normalizeWindowsPath(input: string): string {
  return input.replace(/\//g, '\\').toLowerCase();
}

function pathEntries(): string[] {
  const raw = process.env.PATH || process.env.Path || '';
  return raw.split(path.delimiter).map((entry) => entry.trim()).filter(Boolean);
}

function resolveExecutableOnWindows(name: string): string | undefined {
  const extensions = ['.exe', '.cmd', '.bat', '.ps1'];
  for (const dir of pathEntries()) {
    const base = path.join(dir, name);
    for (const ext of ['', ...extensions]) {
      const candidate = base + ext;
      try {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return path.resolve(candidate);
        }
      } catch {
        // Ignore inaccessible entries.
      }
    }
  }
  return undefined;
}

function findCodexStandaloneDir(): string | undefined {
  const home = os.homedir();
  const current = path.join(home, '.codex', 'packages', 'standalone', 'current');
  const helperInCurrent = path.join(current, 'codex-resources', 'codex-windows-sandbox-setup.exe');
  if (fs.existsSync(helperInCurrent)) {
    return current;
  }

  const releases = path.join(home, '.codex', 'packages', 'standalone', 'releases');
  if (!fs.existsSync(releases)) {
    return undefined;
  }

  let best: { dir: string; mtime: number } | undefined;
  for (const entry of fs.readdirSync(releases)) {
    const dir = path.join(releases, entry);
    const helper = path.join(dir, 'codex-resources', 'codex-windows-sandbox-setup.exe');
    if (!fs.existsSync(helper)) {
      continue;
    }
    try {
      const stat = fs.statSync(helper);
      if (!best || stat.mtimeMs > best.mtime) {
        best = { dir, mtime: stat.mtimeMs };
      }
    } catch {
      // Ignore inaccessible entries.
    }
  }

  return best?.dir;
}

function codexHealthCheck(agent: AgentConfig): HealthCheckResult[] {
  if (process.platform !== 'win32') {
    return [
      {
        agent: agent.id,
        check: 'codex-windows-sandbox',
        severity: 'ok',
        message: 'Codex Windows sandbox check is only relevant on Windows.',
      },
    ];
  }

  const standaloneDir = findCodexStandaloneDir();
  if (!standaloneDir) {
    return [
      {
        agent: agent.id,
        check: 'codex-windows-sandbox',
        severity: 'ok',
        message: 'Codex standalone package not detected; nothing to verify.',
      },
    ];
  }

  const resourcesDir = path.join(standaloneDir, 'codex-resources');
  const helperPath = path.join(resourcesDir, 'codex-windows-sandbox-setup.exe');
  if (!fs.existsSync(helperPath)) {
    return [
      {
        agent: agent.id,
        check: 'codex-windows-sandbox',
        severity: 'ok',
        message: 'Codex sandbox helper not found; nothing to verify.',
      },
    ];
  }

  const resolvedCodex = resolveExecutableOnWindows('codex');
  const usingPackageBinary =
    !!resolvedCodex &&
    normalizeWindowsPath(resolvedCodex).startsWith(normalizeWindowsPath(standaloneDir) + '\\');

  const helperOnPath = pathEntries().some(
    (entry) => normalizeWindowsPath(entry) === normalizeWindowsPath(resourcesDir)
  );

  if (usingPackageBinary || helperOnPath) {
    return [
      {
        agent: agent.id,
        check: 'codex-windows-sandbox',
        severity: 'ok',
        message: 'Codex Windows sandbox helper is discoverable.',
      },
    ];
  }

  const packageBinary = path.join(standaloneDir, 'bin', 'codex.exe');
  return [
    {
      agent: agent.id,
      check: 'codex-windows-sandbox',
      severity: 'warning',
      message:
        'Codex hooks may fail because the Windows sandbox helper is not discoverable. ' +
        `Launch Codex from "${packageBinary}" or prepend "${resourcesDir}" to PATH.`,
      docUrl: CODEX_SANDBOX_DOC_URL,
    },
  ];
}

const HEALTH_CHECKS: Record<string, AgentHealthCheck> = {
  codex: codexHealthCheck,
};

export function checkAgentHealth(agent: AgentConfig): HealthCheckResult[] {
  const check = HEALTH_CHECKS[agent.id];
  if (!check) {
    return [
      {
        agent: agent.id,
        check: 'supported',
        severity: 'ok',
        message: agent.hooks.supported
          ? `${agent.id} hooks are supported.`
          : `${agent.id} hooks are not supported.`,
      },
    ];
  }
  return check(agent);
}

export function checkAllAgentsHealth(): HealthCheckResult[] {
  const { listSupportedAgents } = require('./agents');
  const agents: AgentConfig[] = listSupportedAgents();
  const results: HealthCheckResult[] = [];
  for (const agent of agents) {
    results.push(...checkAgentHealth(agent));
  }
  return results;
}
