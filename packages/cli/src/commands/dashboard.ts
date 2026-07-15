import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import type { CliOptions, CommandContext } from '../args';

function checkDashboardDependencies(packageRoot: string): string[] {
  const dashboardPkgPath = path.join(packageRoot, 'servers', 'dashboard', 'package.json');
  if (!fs.existsSync(dashboardPkgPath)) {
    return [];
  }

  const pkg = JSON.parse(fs.readFileSync(dashboardPkgPath, 'utf8'));
  const deps = Object.keys(pkg.dependencies || {});
  const dashboardDir = path.dirname(dashboardPkgPath);
  const missing: string[] = [];

  for (const dep of deps) {
    try {
      require.resolve(dep, { paths: [dashboardDir] });
    } catch {
      missing.push(dep);
    }
  }

  return missing;
}

export function resolveDashboardAddress(options: CliOptions): { host: string; port: number } {
  const envPort = Number(process.env.CREWLOOP_DASHBOARD_PORT);
  const port =
    options.port ??
    (Number.isInteger(envPort) && envPort >= 1 && envPort <= 65535 ? envPort : 7890);
  const host = options.host ?? process.env.CREWLOOP_DASHBOARD_HOST ?? '127.0.0.1';
  return { host, port };
}

export async function runDashboard(options: CliOptions, context: CommandContext): Promise<number> {
  const { stdout, stderr } = context;
  const dashboardBin = path.join(
    context.packageRoot,
    'servers',
    'dashboard',
    'bin',
    'crewloop-dashboard.js'
  );

  if (!fs.existsSync(dashboardBin)) {
    stderr('error: dashboard server not found');
    stderr('hint: build it with: cd servers/dashboard && npm install && npm run build');
    return 1;
  }

  const missing = checkDashboardDependencies(context.packageRoot);
  if (missing.length > 0) {
    stderr(`error: dashboard is missing dependencies: ${missing.join(', ')}`);
    stderr('hint: reinstall with: npm install -g @archznn/crewloop-skills');
    return 1;
  }

  const env: NodeJS.ProcessEnv = { ...process.env };
  if (options.port !== undefined) {
    env.CREWLOOP_DASHBOARD_PORT = String(options.port);
  }
  if (options.host !== undefined) {
    env.CREWLOOP_DASHBOARD_HOST = options.host;
  }

  const { host, port } = resolveDashboardAddress(options);
  stdout(`starting dashboard on ${host}:${port}`);

  const child = spawn(process.execPath, [dashboardBin], {
    env,
    stdio: 'inherit',
  });

  return new Promise((resolve) => {
    let settled = false;
    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      stderr(`error: failed to start dashboard: ${error.message}`);
      resolve(1);
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      resolve(code ?? 0);
    });
  });
}
