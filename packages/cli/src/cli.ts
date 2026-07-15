import path from 'node:path';
import fs from 'node:fs';
import {
  parseArgs,
  CliUsageError,
  CliUnknownCommandError,
  type CliOptions,
  type CommandContext,
} from './args';
import { printHelp } from './help';
import { formatUsageError, formatUnknownCommand } from './output';
import { runInstall } from './commands/install';
import { runList } from './commands/list';
import { runAgents } from './commands/agents';
import { runDoctorCommand } from './commands/doctor';
import { runDashboard } from './commands/dashboard';

export { parseArgs, CliUsageError, CliUnknownCommandError } from './args';
export type { CliOptions, CommandContext, CommandName } from './args';
export { printHelp, printCommandHelp } from './help';

function resolvePackageRoot(): string {
  try {
    const skillsPackageJson = require.resolve('@archznn/crewloop-skills/package.json');
    return path.dirname(skillsPackageJson);
  } catch {
    const bundledRoot = path.resolve(__dirname, '..', '..', '..');
    if (fs.existsSync(path.join(bundledRoot, 'skills', 'crewloop-hub', 'SKILL.md'))) {
      return bundledRoot;
    }

    const cwdNodeModules = path.join(process.cwd(), 'node_modules', '@archznn', 'crewloop-skills');
    if (fs.existsSync(path.join(cwdNodeModules, 'package.json'))) {
      return cwdNodeModules;
    }
  }

  throw new Error(
    'Could not find CrewLoop package root. Reinstall with: npm install -g @archznn/crewloop-skills'
  );
}

function getVersion(): string {
  try {
    const packageRoot = resolvePackageRoot();
    const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    return pkg.version as string;
  } catch {
    const fallback = path.resolve(__dirname, '..', '..', '..');
    const pkg = JSON.parse(fs.readFileSync(path.join(fallback, 'package.json'), 'utf8'));
    return pkg.version as string;
  }
}

function createContext(packageRoot: string): CommandContext {
  return {
    packageRoot,
    stdout: (line: string) => console.log(line),
    stderr: (line: string) => console.error(line),
  };
}

export async function run(argv: string[]): Promise<number> {
  let options: CliOptions;

  try {
    options = parseArgs(['node', 'crewloop', ...argv]);
  } catch (error) {
    if (error instanceof CliUsageError) {
      for (const line of formatUsageError(error)) console.error(line);
      return error.exitCode;
    }
    if (error instanceof CliUnknownCommandError) {
      for (const line of formatUnknownCommand(error.invalidCommand)) console.error(line);
      return error.exitCode;
    }
    throw error;
  }

  try {
    switch (options.command) {
      case 'help':
        console.log(printHelp(options.helpTopic));
        return 0;
      case 'version':
        console.log(getVersion());
        return 0;
      case 'install':
        return await runInstall(options, createContext(resolvePackageRoot()));
      case 'list':
        return runList(options, createContext(resolvePackageRoot()));
      case 'agents':
        return runAgents(options, createContext(''));
      case 'doctor':
        return runDoctorCommand(
          options,
          (line) => console.log(line),
          (line) => console.error(line),
          resolvePackageRoot
        );
      case 'dashboard':
        return await runDashboard(options, createContext(resolvePackageRoot()));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`error: ${message}`);
    return 1;
  }
}
