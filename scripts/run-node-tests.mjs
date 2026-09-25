import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

async function findTestFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findTestFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(entryPath);
    }
  }

  return files;
}

async function main() {
  const distDirectory = path.resolve(process.argv[2] ?? 'dist');
  let testFiles;

  try {
    testFiles = await findTestFiles(distDirectory);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Unable to discover compiled tests in ${distDirectory}: ${message}`);
    process.exitCode = 1;
    return;
  }

  if (testFiles.length === 0) {
    console.error(`No compiled *.test.js files found in ${distDirectory}`);
    process.exitCode = 1;
    return;
  }

  testFiles.sort();
  const result = spawnSync(process.execPath, ['--test', ...testFiles], { stdio: 'inherit' });

  if (result.error) {
    console.error(`Unable to start Node's test runner: ${result.error.message}`);
    process.exitCode = 1;
    return;
  }

  process.exitCode = result.status ?? 1;
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Test discovery failed: ${message}`);
  process.exitCode = 1;
});
