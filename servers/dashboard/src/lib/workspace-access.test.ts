import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  resolveContainedPath,
  listWorkspaceFiles,
  readTextFile,
  WorkspaceAccessError,
} from './workspace-access';

const LIMITS = { fileBytes: 1024 * 1024, workspaceEntries: 100, workspaceDepth: 10 };

describe('workspace access policy', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-ws-'));
    fs.mkdirSync(path.join(root, 'src'), { recursive: true });
    fs.writeFileSync(path.join(root, 'src', 'a.txt'), 'hello');
    fs.writeFileSync(path.join(root, 'b.txt'), 'world');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('resolves a relative path inside the root', async () => {
    const resolved = await resolveContainedPath(root, 'src/a.txt');
    assert.equal(resolved, await fs.promises.realpath(path.join(root, 'src', 'a.txt')));
  });

  it('rejects traversal outside the root', async () => {
    await assert.rejects(resolveContainedPath(root, '../outside.txt'), (err: any) => {
      assert.equal(err instanceof WorkspaceAccessError, true);
      assert.equal(err.code, 'PATH_FORBIDDEN');
      return true;
    });
  });

  it('rejects absolute paths', async () => {
    await assert.rejects(resolveContainedPath(root, '/etc/passwd'), (err: any) => {
      assert.equal(err.code, 'PATH_FORBIDDEN');
      return true;
    });
  });

  it('rejects sibling-prefix paths outside the root', async () => {
    const sibling = root + '-sibling';
    fs.mkdirSync(sibling, { recursive: true });
    fs.writeFileSync(path.join(sibling, 'x.txt'), 'nope');
    try {
      await assert.rejects(
        resolveContainedPath(root, path.relative(root, path.join(sibling, 'x.txt'))),
        (err: any) => {
          assert.equal(err.code, 'PATH_FORBIDDEN');
          return true;
        }
      );
    } finally {
      fs.rmSync(sibling, { recursive: true, force: true });
    }
  });

  it('rejects symlinks whose targets escape the root', async () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-out-'));
    fs.writeFileSync(path.join(outside, 'secret.txt'), 'secret');
    fs.symlinkSync(path.join(outside, 'secret.txt'), path.join(root, 'link.txt'));
    try {
      await assert.rejects(resolveContainedPath(root, 'link.txt'), (err: any) => {
        assert.equal(err.code, 'PATH_FORBIDDEN');
        return true;
      });
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });

  it('allows symlinks that stay inside the root', async () => {
    fs.symlinkSync(path.join(root, 'b.txt'), path.join(root, 'inner-link.txt'));
    const resolved = await resolveContainedPath(root, 'inner-link.txt');
    assert.equal(resolved, await fs.promises.realpath(path.join(root, 'b.txt')));
  });

  it('lists relative files excluding heavy directories', async () => {
    fs.mkdirSync(path.join(root, 'node_modules', 'pkg'), { recursive: true });
    fs.writeFileSync(path.join(root, 'node_modules', 'pkg', 'x.js'), 'x');
    const files = await listWorkspaceFiles(root, LIMITS);
    assert.deepEqual(files.sort(), ['b.txt', 'src/a.txt'].sort());
  });

  it('does not follow directory symlinks that escape the root', async () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-out-dir-'));
    fs.writeFileSync(path.join(outside, 'leak.txt'), 'leak');
    fs.symlinkSync(outside, path.join(root, 'out-link'));
    try {
      const files = await listWorkspaceFiles(root, LIMITS);
      assert.equal(files.includes('out-link/leak.txt'), false);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });

  it('fails when the entry limit is exceeded', async () => {
    for (let i = 0; i < 5; i++) {
      fs.writeFileSync(path.join(root, `f${i}.txt`), 'x');
    }
    await assert.rejects(
      listWorkspaceFiles(root, { ...LIMITS, workspaceEntries: 3 }),
      (err: any) => {
        assert.equal(err.code, 'WORKSPACE_LIMIT_EXCEEDED');
        return true;
      }
    );
  });

  it('reads a text file within the size limit', async () => {
    const content = await readTextFile(path.join(root, 'src', 'a.txt'), LIMITS.fileBytes);
    assert.equal(content, 'hello');
  });

  it('rejects files larger than the limit', async () => {
    fs.writeFileSync(path.join(root, 'big.txt'), 'x'.repeat(2048));
    await assert.rejects(readTextFile(path.join(root, 'big.txt'), 100), (err: any) => {
      assert.equal(err.code, 'FILE_TOO_LARGE');
      return true;
    });
  });

  it('rejects binary files', async () => {
    fs.writeFileSync(path.join(root, 'bin.dat'), Buffer.from([0x00, 0x01, 0x02]));
    await assert.rejects(readTextFile(path.join(root, 'bin.dat'), LIMITS.fileBytes), (err: any) => {
      assert.equal(err.code, 'BINARY_FILE_UNSUPPORTED');
      return true;
    });
  });
});
