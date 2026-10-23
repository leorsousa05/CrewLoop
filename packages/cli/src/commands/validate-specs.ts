import fs from 'node:fs';
import path from 'node:path';
import type { CliOptions, CommandContext } from '../args';
import { scopeToChanged, validateSpecs } from '../specs-validator';

export function runValidateSpecs(options: CliOptions, context: CommandContext): number {
  const root = path.resolve(options.root ?? process.cwd());
  const specs = path.join(root, 'specs');
  if (!fs.existsSync(specs) || !fs.statSync(specs).isDirectory()) {
    context.stderr(`error: specs directory not found: ${specs}`);
    return 2;
  }

  const report = scopeToChanged(root, validateSpecs(root), options.changed);
  const errors = report.issues.filter((issue) => issue.level === 'error').length;

  if (options.json) {
    context.stdout(JSON.stringify({ ok: errors === 0, files: report.files, issues: report.issues }, null, 2));
  } else {
    for (const issue of report.issues) {
      context.stdout(`${issue.level.toUpperCase().padEnd(7)} ${issue.path}: ${issue.code}: ${issue.message}`);
    }
    const warnings = report.issues.length - errors;
    context.stdout(`${errors ? 'FAIL' : 'PASS'} ${report.files} feature specs, ${errors} errors, ${warnings} warnings`);
  }
  return errors ? 1 : 0;
}
