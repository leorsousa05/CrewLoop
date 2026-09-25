import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  analyzeAcceptanceMatrix,
  runAcceptanceMatrixCheck,
} from '../check-dashboard-acceptance-matrix.mjs';

const matrixPath = path.resolve(process.cwd(), 'tests/dashboard-acceptance-matrix.md');

function currentMatrix() {
  return fs.readFileSync(matrixPath, 'utf8');
}

function matrixFixture({ complete }) {
  let section = '';
  const viewNames = new Set(['Overview', 'Sessions', 'Timeline', 'Files', 'Skills', 'Usage', 'Settings']);
  const runRecordValues = new Map([
    ['Date/time', '2026-01-01 00:00:00 UTC'],
    ['Commit', 'fixture-commit-123'],
    ['OS', 'Fixture OS'],
    ['Browser', 'Fixture browser/1.0'],
    ['Server URL', 'http://127.0.0.1:7890'],
    ['Actual desktop viewport', '1440 × 1000 CSS px'],
    ['Actual mobile viewport', '390 × 844 CSS px'],
    ['Assistive technology', complete ? 'Fixture assistive technology' : 'None; screen-reader walkthrough pending'],
  ]);
  return currentMatrix().split(/\r?\n/).map((line) => {
    const heading = line.trim();
    if (heading.startsWith('## ')) {
      section = heading === '## Run record' ? 'runRecord'
        : heading === '## View matrix' ? 'views'
          : heading === '## Interaction matrix' ? 'interactions'
          : '';
    }

    if (section === 'runRecord' && line.startsWith('|')) {
      const cells = line.split('|');
      const value = runRecordValues.get(cells[1]?.trim());
      if (value) {
        cells[2] = ` \`${value}\` `;
        return cells.join('|');
      }
    }

    if (section === 'views' && line.startsWith('|')) {
      const cells = line.split('|');
      if (viewNames.has(cells[1]?.trim())) {
        for (let index = 2; index < cells.length - 1; index += 1) {
          cells[index] = complete ? ' P ' : ' [ ] ';
        }
        return cells.join('|');
      }
    }

    if (section === 'interactions' && line.startsWith('|')) {
      const cells = line.split('|');
      const isSeparator = cells.slice(1, -1).every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
      if (cells.length === 6 && cells[1]?.trim() !== 'Area' && !isSeparator) {
        cells[4] = complete ? ' `PASS — manually verified` ' : ' `[record]` ';
        return cells.join('|');
      }
    }

    return line;
  }).join('\n');
}

function withTemporaryMatrix(content, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-acceptance-matrix-'));
  const file = path.join(root, 'matrix.md');
  try {
    fs.writeFileSync(file, content, 'utf8');
    return callback(file);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('reports an incomplete fixture without mutating the checked-in matrix', () => {
  const checkedInBefore = currentMatrix();
  const fixture = matrixFixture({ complete: false });
  const report = analyzeAcceptanceMatrix(fixture);

  assert.equal(report.status, 'incomplete');
  assert.equal(report.complete, false);
  assert.deepEqual(report.runRecord.pendingFields, ['Assistive technology']);
  assert.equal(report.views.total, 112);
  assert.equal(report.views.recorded, 0);
  assert.equal(report.views.pending, 112);
  assert.equal(report.interactions.total, 12);
  assert.equal(report.interactions.recorded, 0);
  assert.equal(report.interactions.pending, 12);
  assert.equal(currentMatrix(), checkedInBefore);
});

test('accepts a fully recorded matrix fixture without interpreting its claims', () => {
  const report = analyzeAcceptanceMatrix(matrixFixture({ complete: true }));

  assert.equal(report.status, 'complete');
  assert.equal(report.complete, true);
  assert.equal(report.runRecord.recorded, 8);
  assert.equal(report.views.recorded, 112);
  assert.equal(report.views.pending, 0);
  assert.equal(report.interactions.recorded, 12);
  assert.equal(report.interactions.pending, 0);
});

test('fails closed on malformed matrix shape and unknown CLI options', () => {
  const malformed = currentMatrix().replace('| Overview |', '| Overview | [invalid] |');
  const report = analyzeAcceptanceMatrix(malformed);
  assert.equal(report.status, 'invalid');
  assert.ok(report.views.invalid > 0);

  let stdout = '';
  let stderr = '';
  const exitCode = runAcceptanceMatrixCheck(['--unknown'], {
    stdout: (value) => { stdout += value; },
    stderr: (value) => { stderr += value; },
  });
  assert.equal(exitCode, 2);
  assert.equal(stdout, '');
  assert.match(stderr, /usage: --file/);
});

test('emits bounded JSON and returns the incomplete exit code for an incomplete fixture', () => {
  const checkedInBefore = currentMatrix();
  const fixture = matrixFixture({ complete: false });
  withTemporaryMatrix(fixture, (file) => {
    let stdout = '';
    let stderr = '';
    const exitCode = runAcceptanceMatrixCheck(['--file', file, '--format', 'json'], {
      stdout: (value) => { stdout += value; },
      stderr: (value) => { stderr += value; },
    });
    const report = JSON.parse(stdout);

    assert.equal(exitCode, 1);
    assert.equal(stderr, '');
    assert.equal(report.status, 'incomplete');
    assert.equal(report.views.pending, 112);
    assert.equal(report.interactions.pending, 12);
    assert.doesNotMatch(stdout, /prompt|response|credential|provider payload|transcript/i);
    assert.equal(fs.readFileSync(file, 'utf8'), fixture);
  });
  assert.equal(currentMatrix(), checkedInBefore);
});

test('returns complete from a temporary fully recorded file', () => {
  const fixture = matrixFixture({ complete: true });
  withTemporaryMatrix(fixture, (file) => {
    let stdout = '';
    let stderr = '';
    const exitCode = runAcceptanceMatrixCheck(['--file', file], {
      stdout: (value) => { stdout += value; },
      stderr: (value) => { stderr += value; },
    });
    assert.equal(exitCode, 0);
    assert.equal(stderr, '');
    assert.match(stdout, /Dashboard acceptance matrix: COMPLETE/);
    assert.match(stdout, /View cells: 112\/112 recorded/);
    assert.match(stdout, /Interaction rows: 12\/12 recorded/);
    assert.equal(fs.readFileSync(file, 'utf8'), fixture);
  });
});
