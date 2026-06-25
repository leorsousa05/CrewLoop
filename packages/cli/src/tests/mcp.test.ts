import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { installMcpServer, type McpInstallStep } from '../mcp';

function createFakePython(baseDir: string): { pythonCmd: string } {
  const isWindows = os.platform() === 'win32';
  const binDir = path.join(baseDir, 'bin');
  fs.mkdirSync(binDir, { recursive: true });

  const pythonCmd = path.join(binDir, isWindows ? 'python.cmd' : 'python');

  const unixScript = `#!/bin/sh
if [ "$1" = "--version" ]; then exit 0; fi
if [ "$1" = "-m" ] && [ "$2" = "venv" ]; then
  VENV="$3"
  mkdir -p "$VENV/bin"
  mkdir -p "$VENV/Scripts"
  if [ -n "$CREWLOOP_PIP_FAIL" ]; then
    cat > "$VENV/bin/pip" <<'PIP_EOF'
#!/bin/sh
exit 1
PIP_EOF
  else
    cat > "$VENV/bin/pip" <<'PIP_EOF'
#!/bin/sh
if [ "$1" = "install" ]; then
  touch "$(dirname "$0")/obsidian-mcp"
  exit 0
fi
exit 1
PIP_EOF
  fi
  chmod +x "$VENV/bin/pip"
  exit 0
fi
exit 1
`;

  const windowsScript = `@echo off
if "%1"=="--version" exit /b 0
if "%1"=="-m" if "%2"=="venv" (
  mkdir "%3/Scripts"
  mkdir "%3/bin"
  if defined CREWLOOP_PIP_FAIL (
    (
      echo @echo off
      echo exit /b 1
    ) > "%3/Scripts/pip.cmd"
  ) else (
    (
      echo @echo off
      echo if "%%1"=="install" ^(
      echo   type nul ^> "%%~dp0obsidian-mcp.exe"
      echo   exit /b 0
      echo ^)
      echo exit /b 1
    ) > "%3/Scripts/pip.cmd"
  )
  exit /b 0
)
exit /b 1
`;

  fs.writeFileSync(pythonCmd, isWindows ? windowsScript : unixScript);
  if (!isWindows) {
    fs.chmodSync(pythonCmd, 0o755);
  }

  return { pythonCmd };
}

describe('mcp', () => {
  let mcpSourceDir: string;
  let localBinDir: string;
  let fakePythonDir: string;

  before(() => {
    mcpSourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-mcp-'));
    localBinDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-bin-'));
    fakePythonDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-fakepy-'));

    fs.writeFileSync(path.join(mcpSourceDir, 'pyproject.toml'), '[project]\nname = "obsidian-mcp"\n');
  });

  after(() => {
    fs.rmSync(mcpSourceDir, { recursive: true, force: true });
    fs.rmSync(localBinDir, { recursive: true, force: true });
    fs.rmSync(fakePythonDir, { recursive: true, force: true });
    delete process.env.CREWLOOP_PIP_FAIL;
  });

  it('dry-run reports would-install without creating venv', () => {
    const { pythonCmd } = createFakePython(fakePythonDir);

    const result = installMcpServer(mcpSourceDir, {
      dryRun: true,
      pythonCmd,
      localBinDir,
    });

    assert.strictEqual(result.installed, true);
    assert.strictEqual(result.skipped, false);
    assert.strictEqual(result.error, undefined);
    assert.ok(result.binaryPath);
    assert.ok(!fs.existsSync(path.join(mcpSourceDir, '.venv')));
  });

  it('missing python is reported as an error but not thrown', () => {
    const result = installMcpServer(mcpSourceDir, {
      pythonCmd: path.join(fakePythonDir, 'missing-python'),
      localBinDir,
    });

    assert.strictEqual(result.installed, false);
    assert.strictEqual(result.skipped, false);
    assert.ok(result.error);
    assert.ok(result.error.message.includes('Python not found'));
  });

  it('pip failure is reported as an error', () => {
    const { pythonCmd } = createFakePython(fakePythonDir);
    process.env.CREWLOOP_PIP_FAIL = '1';

    try {
      const result = installMcpServer(mcpSourceDir, {
        pythonCmd,
        localBinDir,
        force: true,
      });

      assert.strictEqual(result.installed, false);
      assert.strictEqual(result.skipped, false);
      assert.ok(result.error);
    } finally {
      delete process.env.CREWLOOP_PIP_FAIL;
    }
  });

  it('successful install creates venv, runs pip, and exposes binary', () => {
    const { pythonCmd } = createFakePython(fakePythonDir);

    const result = installMcpServer(mcpSourceDir, {
      pythonCmd,
      localBinDir,
      force: true,
    });

    assert.strictEqual(result.installed, true);
    assert.strictEqual(result.skipped, false);
    assert.strictEqual(result.error, undefined);
    assert.ok(result.binaryPath);
    assert.ok(fs.existsSync(result.binaryPath));
  });

  it('skips install when binary already exists and force is false', () => {
    const { pythonCmd } = createFakePython(fakePythonDir);

    const result = installMcpServer(mcpSourceDir, {
      pythonCmd,
      localBinDir,
    });

    assert.strictEqual(result.installed, false);
    assert.strictEqual(result.skipped, true);
    assert.ok(result.binaryPath);
  });

  it('emits progress steps in order on successful install', () => {
    const { pythonCmd } = createFakePython(fakePythonDir);
    const steps: McpInstallStep[] = [];

    const result = installMcpServer(mcpSourceDir, {
      pythonCmd,
      localBinDir,
      force: true,
      onProgress: (progress) => steps.push(progress.step),
    });

    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(steps, [
      'check_python',
      'create_venv',
      'install_package',
      'expose_binary',
      'complete',
    ]);
  });

  it('dry-run emits check_python and complete only', () => {
    const { pythonCmd } = createFakePython(fakePythonDir);
    const steps: McpInstallStep[] = [];

    // Ensure a previous test did not leave a venv behind.
    const venvDir = path.join(mcpSourceDir, '.venv');
    if (fs.existsSync(venvDir)) {
      fs.rmSync(venvDir, { recursive: true, force: true });
    }

    const result = installMcpServer(mcpSourceDir, {
      pythonCmd,
      localBinDir,
      dryRun: true,
      onProgress: (progress) => steps.push(progress.step),
    });

    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(steps, ['check_python', 'complete']);
    assert.ok(!fs.existsSync(venvDir));
  });

  it('missing Python emits only check_python and returns error', () => {
    const steps: McpInstallStep[] = [];

    const result = installMcpServer(mcpSourceDir, {
      pythonCmd: path.join(fakePythonDir, 'missing-python'),
      localBinDir,
      onProgress: (progress) => steps.push(progress.step),
    });

    assert.ok(result.error);
    assert.deepStrictEqual(steps, ['check_python']);
  });

  it('pip failure emits through install_package and returns error', () => {
    const { pythonCmd } = createFakePython(fakePythonDir);
    process.env.CREWLOOP_PIP_FAIL = '1';

    try {
      const steps: McpInstallStep[] = [];
      const result = installMcpServer(mcpSourceDir, {
        pythonCmd,
        localBinDir,
        force: true,
        onProgress: (progress) => steps.push(progress.step),
      });

      assert.ok(result.error);
      assert.deepStrictEqual(steps, [
        'check_python',
        'create_venv',
        'install_package',
      ]);
    } finally {
      delete process.env.CREWLOOP_PIP_FAIL;
    }
  });

  it('reports duration in milliseconds', () => {
    const { pythonCmd } = createFakePython(fakePythonDir);

    const result = installMcpServer(mcpSourceDir, {
      pythonCmd,
      localBinDir,
      force: true,
    });

    assert.strictEqual(result.error, undefined);
    assert.ok(typeof result.durationMs === 'number');
    assert.ok(result.durationMs >= 0);
  });
});
