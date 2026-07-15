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
const SHARED_NAMESPACE = '_crewloop';

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function removeDir(dir: string): void {
  const stats = fs.lstatSync(dir);
  if (stats.isDirectory() && !stats.isSymbolicLink()) {
    fs.rmSync(dir, { recursive: true, force: true });
  } else {
    fs.unlinkSync(dir);
  }
}

function pathEntryExists(entryPath: string): boolean {
  try {
    fs.lstatSync(entryPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
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

function createSymlink(source: string, target: string, isDirectory: boolean): void {
  const type = os.platform() === 'win32' && isDirectory ? 'junction' : isDirectory ? 'dir' : 'file';
  fs.symlinkSync(source, target, type);
}

function rewriteSharedLinks(content: string): string {
  return content
    .replace(/\.\.\/\.\.\/references\//g, `${SHARED_NAMESPACE}/references/`)
    .replace(/\.\.\/\.\.\/assets\//g, `${SHARED_NAMESPACE}/assets/`);
}

function assertReservedNamespaceAvailable(sourcePath: string): void {
  if (fs.existsSync(path.join(sourcePath, SHARED_NAMESPACE))) {
    throw new Error(`Skill source reserves the installer namespace "${SHARED_NAMESPACE}": ${sourcePath}`);
  }
}

function writeInstalledSkill(sourcePath: string, targetPath: string, rewriteLinks: boolean): void {
  const content = fs.readFileSync(path.join(sourcePath, 'SKILL.md'), 'utf-8');
  fs.writeFileSync(
    path.join(targetPath, 'SKILL.md'),
    rewriteLinks ? rewriteSharedLinks(content) : content,
    'utf-8'
  );
}

function installSharedDirectories(
  targetPath: string,
  sharedRoot: string | undefined,
  symlink: boolean
): void {
  if (!sharedRoot) {
    return;
  }

  const availableDirs = SHARED_DIRS.filter((dir) => fs.existsSync(path.join(sharedRoot, dir)));
  if (availableDirs.length === 0) {
    return;
  }

  const namespacePath = path.join(targetPath, SHARED_NAMESPACE);
  ensureDir(namespacePath);

  for (const dir of availableDirs) {
    const sourceDir = path.join(sharedRoot, dir);
    const sharedTargetPath = path.join(namespacePath, dir);
    if (symlink) {
      createSymlink(sourceDir, sharedTargetPath, true);
    } else {
      copyDir(sourceDir, sharedTargetPath);
    }
  }
}

function installCopiedSkill(sourcePath: string, targetPath: string, sharedRoot?: string): void {
  copyDir(sourcePath, targetPath);
  writeInstalledSkill(sourcePath, targetPath, Boolean(sharedRoot));
  installSharedDirectories(targetPath, sharedRoot, false);
}

function installLinkedSkill(sourcePath: string, targetPath: string, sharedRoot?: string): void {
  ensureDir(targetPath);
  writeInstalledSkill(sourcePath, targetPath, Boolean(sharedRoot));

  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    if (entry.name === 'SKILL.md') {
      continue;
    }

    createSymlink(
      path.join(sourcePath, entry.name),
      path.join(targetPath, entry.name),
      entry.isDirectory()
    );
  }

  installSharedDirectories(targetPath, sharedRoot, true);
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
    const exists = pathEntryExists(targetPath);

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

      assertReservedNamespaceAvailable(skill.sourcePath);

      if (options.symlink) {
        installLinkedSkill(skill.sourcePath, targetPath, sharedRoot);
      } else {
        installCopiedSkill(skill.sourcePath, targetPath, sharedRoot);
      }

      result.installed.push(skill.name);
    } catch (error) {
      result.errors.push(error instanceof Error ? error : new Error(String(error)));
    }
  }

  return result;
}
