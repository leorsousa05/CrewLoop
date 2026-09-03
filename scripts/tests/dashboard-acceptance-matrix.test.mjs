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

function completedMatrix() {
  return currentMatrix()
    .replace('`None; screen-reader walkthrough pending`', '`NVDA; screen-reader walkthrough recorded`')
    .replaceAll('[ ]', '[x]')
    .replaceAll('[record]', 'Pass — manually verified');
}

test('reports the checked-in matrix as incomplete without mutating it', () => {
  const before = currentMatrix();
  const report = analyzeAcceptanceMatrix(before);
  const after = currentMatrix();

  assert.equal(report.status, 'incomplete');
  assert.equal(report.complete, false);
  assert.deepEqual(report.runRecord.pendingFields, ['Assistive technology']);
  assert.equal(report.views.total, 112);
  assert.equal(report.views.recorded, 0);
  assert.equal(report.views.pending, 112);
  assert.equal(report.interactions.total, 12);
  assert.equal(report.interactions.recorded, 0);
  assert.equal(report.interactions.pending, 12);
  assert.equal(after, before);
});

test('accepts a fully recorded matrix fixture without interpreting its claims', () => {
  const report = analyzeAcceptanceMatrix(completedMatrix());

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

test('emits bounded JSON and returns the incomplete exit code for the checked-in matrix', () => {
  let stdout = '';
  let stderr = '';
  const exitCode = runAcceptanceMatrixCheck(['--file', matrixPath, '--format', 'json'], {
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
});

test('returns complete from a temporary fully recorded file', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-acceptance-matrix-'));
  try {
    const file = path.join(root, 'matrix.md');
    fs.writeFileSync(file, completedMatrix(), 'utf8');
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
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
