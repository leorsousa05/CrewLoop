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

const SHARED_DIRS = ['references', 'assets'];

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

function rewriteSharedLinks(skillPath: string): void {
  const skillFile = path.join(skillPath, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    return;
  }

  const content = fs.readFileSync(skillFile, 'utf-8');
  const updated = content
    .replace(/\.\.\/\.\.\/references\//g, 'references/')
    .replace(/\.\.\/\.\.\/assets\//g, 'assets/');

  if (updated !== content) {
    fs.writeFileSync(skillFile, updated, 'utf-8');
  }
}

export interface InstallResult {
  installed: string[];
  skipped: string[];
  errors: Error[];
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

      if (sharedRoot) {
        for (const dir of SHARED_DIRS) {
          const sourceDir = path.join(sharedRoot, dir);
          if (!fs.existsSync(sourceDir)) {
            continue;
          }

          const sharedTargetPath = path.join(targetPath, dir);

          if (options.symlink) {
            fs.rmSync(sharedTargetPath, { recursive: true, force: true });
            createSymlink(sourceDir, sharedTargetPath);
          } else {
            copyDir(sourceDir, sharedTargetPath);
          }
        }

        if (!options.symlink) {
          rewriteSharedLinks(targetPath);
        }
      }

      result.installed.push(skill.name);
    } catch (error) {
      result.errors.push(error instanceof Error ? error : new Error(String(error)));
    }
  }

  return result;
}
