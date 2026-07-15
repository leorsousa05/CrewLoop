import type { CliOptions, CommandContext } from '../args';
import { resolveSkills } from '../resolver';
import { resolveAgentDir } from '../agents';
import { installSkills } from '../installer';
import { installHooks, type HookWriterResult } from '../hooks';
import { displayPath, pluralize } from '../output';
import {
  createDiamondBlockCommandRunner,
  formatDiamondBlockInstallResult,
  DIAMONDBLOCK_INSTALL_HINT,
  type DiamondBlockCommandResult,
  type DiamondBlockCommandRunner,
} from '../diamondblock';

function supportedHookResults(results: HookWriterResult[]): HookWriterResult[] {
  return results.filter((result) => result.status !== 'unsupported');
}

function formatHookCounts(results: HookWriterResult[]): string {
  const configured = results.filter((r) => r.status === 'configured').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const errors = results.filter((r) => r.status === 'error').length;
  const parts = [`${configured} configured`, `${skipped} skipped`];
  if (errors > 0) {
    parts.push(pluralize(errors, 'error'));
  }
  return `hooks: ${parts.join(', ')}`;
}

function verboseHookLines(results: HookWriterResult[]): string[] {
  return results.map((result) => {
    if (result.status === 'error') {
      return `hook: ${result.agent} error: ${result.error?.message ?? 'unknown error'}`;
    }
    const path = result.configPath ? ` ${displayPath(result.configPath)}` : '';
    return `hook: ${result.agent} ${result.status}${path}`;
  });
}

type InstallHooksFn = typeof installHooks;

export async function runInstall(
  options: CliOptions,
  context: CommandContext,
  installHooksFn: InstallHooksFn = installHooks,
  diamondblockRunner?: DiamondBlockCommandRunner
): Promise<number> {
  const { stdout, stderr } = context;
  const skills = resolveSkills(context.packageRoot, options.skills);

  if (skills.length === 0) {
    stderr('error: no matching skills found');
    return 1;
  }

  const targetDir = options.target || resolveAgentDir(options.agent);

  let runner: DiamondBlockCommandRunner | undefined;
  let preflight: DiamondBlockCommandResult | undefined;

  if (options.diamondblock) {
    runner = diamondblockRunner ?? createDiamondBlockCommandRunner();
    if (!runner.findExecutable()) {
      stderr(`error: --diamondblock requested but no diamondblock executable found on PATH; ${DIAMONDBLOCK_INSTALL_HINT}`);
      return 1;
    }
    preflight = runner.preflight({ agent: options.agent, dryRun: true });
    if (preflight.status !== 'ready') {
      const detail = preflight.stderr.trim();
      stderr(
        `error: diamondblock preflight ${preflight.status} (exit code ${preflight.exitCode})` +
          `${detail ? `: ${detail}` : ''}; resolve the issue or rerun without --diamondblock`
      );
      return 1;
    }
  }

  if (options.dryRun) {
    const preview = installSkills(
      skills,
      targetDir,
      {
        target: options.target,
        skills: options.skills,
        agent: options.agent,
        symlink: options.symlink,
        force: options.force,
        dryRun: true,
      },
      context.packageRoot
    );

    stdout(`dry-run: would install ${pluralize(preview.installed.length, 'skill')} to ${targetDir}`);
    if (preview.skipped.length > 0) {
      stdout(`dry-run: would skip ${pluralize(preview.skipped.length, 'existing skill')}`);
    }
    if (options.verbose) {
      for (const name of preview.installed) stdout(`+ ${name}`);
      for (const name of preview.skipped) stdout(`- ${name} (existing)`);
    }

    if (options.hooks === false) {
      stdout('dry-run: hooks skipped (--no-hooks)');
    } else {
      const hookResults = supportedHookResults(installHooksFn({ dryRun: true, backup: true }));
      const configurable = hookResults.filter((r) => r.status === 'configured');
      const hookErrors = hookResults.filter((r) => r.status === 'error');
      if (configurable.length === 0 && hookErrors.length === 0) {
        stdout('dry-run: hooks skipped (no supported agents detected)');
      } else {
        stdout(`dry-run: hooks would be configured for ${pluralize(configurable.length, 'agent')}`);
        if (options.verbose) {
          for (const line of verboseHookLines(hookResults)) stdout(line);
        }
      }
      for (const hookError of hookErrors) {
        stderr(`error: ${hookError.agent}: ${hookError.error?.message ?? 'unknown error'}`);
      }
      if (hookErrors.length > 0) {
        return 1;
      }
    }
    if (preflight) {
      for (const line of formatDiamondBlockInstallResult(preflight).split('\n')) stdout(line);
    }
    return 0;
  }

  const result = installSkills(
    skills,
    targetDir,
    {
      target: options.target,
      skills: options.skills,
      agent: options.agent,
      symlink: options.symlink,
      force: options.force,
      dryRun: false,
    },
    context.packageRoot
  );

  stdout(`installed ${pluralize(result.installed.length, 'skill')} to ${targetDir}`);
  if (options.verbose) {
    for (const name of result.installed) stdout(`+ ${name}`);
    for (const name of result.skipped) stdout(`- ${name} (existing)`);
  }
  if (result.skipped.length > 0) {
    stdout(`skipped ${pluralize(result.skipped.length, 'existing skill')} (use --force to overwrite)`);
  }

  if (result.errors.length > 0) {
    for (const error of result.errors) {
      stderr(`error: ${error.message}`);
    }
    return 1;
  }

  if (options.hooks === false) {
    stdout('hooks: skipped (--no-hooks)');
  } else {
    const hookResults = supportedHookResults(installHooksFn({ dryRun: false, backup: true }));
    const configured = hookResults.filter((r) => r.status === 'configured');
    const hookErrors = hookResults.filter((r) => r.status === 'error');

    if (configured.length === 0 && hookErrors.length === 0) {
      stdout('hooks: skipped (no supported agents detected)');
    } else {
      stdout(formatHookCounts(hookResults));
      if (options.verbose) {
        for (const line of verboseHookLines(hookResults)) stdout(line);
      }
    }

    for (const hookError of hookErrors) {
      stderr(`error: ${hookError.agent}: ${hookError.error?.message ?? 'unknown error'}`);
    }

    if (hookErrors.length > 0) {
      return 1;
    }

    if (configured.length > 0) {
      stdout('next: crewloop dashboard');
    }
  }

  if (options.diamondblock) {
    const dbRunner = runner ?? createDiamondBlockCommandRunner();
    const installResult = dbRunner.install({ agent: options.agent, dryRun: false });
    for (const line of formatDiamondBlockInstallResult(installResult).split('\n')) stdout(line);
    if (installResult.status !== 'configured') {
      stderr(
        `error: diamondblock official install failed (exit code ${installResult.exitCode}); ` +
          'CrewLoop skills/hooks may already be installed (partial state) and were not rolled back'
      );
      return 1;
    }
  }

  return 0;
}
