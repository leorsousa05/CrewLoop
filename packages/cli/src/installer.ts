import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { SkillManifest } from './resolver';

export interface InstallOptions {
  target?: string;
  skills?: string[];
  agent?: string;
  symlink?: boolean;
  force?: boolean;
  dryRun?: boolean;
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function removeDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(source: string, target: string): void {
  ensureDir(target);
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function createSymlink(source: string, target: string): void {
  const type = os.platform() === 'win32' ? 'junction' : 'dir';
  fs.symlinkSync(source, target, type);
}

export interface InstallResult {
  installed: string[];
  skipped: string[];
  errors: Error[];
}

export function mergeSharedDirs(
  targetDir: string,
  sharedRoot: string,
  options: { dryRun?: boolean; symlink?: boolean }
): void {
  const sharedDirs = ['references', 'assets'];
  const sharedTargetDir = path.resolve(targetDir, '..');

  for (const dir of sharedDirs) {
    const sourceDir = path.join(sharedRoot, dir);
    if (!fs.existsSync(sourceDir)) {
      continue;
    }

    const targetPath = path.join(sharedTargetDir, dir);

    if (options.dryRun) {
      continue;
    }

    if (options.symlink) {
      fs.rmSync(targetPath, { recursive: true, force: true });
      createSymlink(sourceDir, targetPath);
    } else {
      copyDir(sourceDir, targetPath);
    }
  }
}

export function installSkills(
  skills: SkillManifest[],
  targetDir: string,
  options: InstallOptions,
  sharedRoot?: string
): InstallResult {
  const result: InstallResult = { installed: [], skipped: [], errors: [] };

  if (skills.length === 0) {
    return result;
  }

  if (!options.dryRun) {
    ensureDir(targetDir);
  }

  for (const skill of skills) {
    const targetPath = path.join(targetDir, skill.name);
    const exists = fs.existsSync(targetPath);

    if (exists && !options.force) {
      result.skipped.push(skill.name);
      continue;
    }

    if (options.dryRun) {
      result.installed.push(skill.name);
      continue;
    }

    try {
      if (exists && options.force) {
        removeDir(targetPath);
      }

      if (options.symlink) {
        createSymlink(skill.sourcePath, targetPath);
      } else {
        copyDir(skill.sourcePath, targetPath);
      }

      result.installed.push(skill.name);
    } catch (error) {
      result.errors.push(error instanceof Error ? error : new Error(String(error)));
    }
  }

  if (sharedRoot) {
    try {
      mergeSharedDirs(targetDir, sharedRoot, {
        dryRun: options.dryRun,
        symlink: options.symlink,
      });
    } catch (error) {
      result.errors.push(error instanceof Error ? error : new Error(String(error)));
    }
  }

  return result;
}
