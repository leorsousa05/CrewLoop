import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  DEFAULT_TELEMETRY_DB_PATH,
  resolveTelemetryDbPath,
  resolveTelemetryTimeZone,
} from './config';

describe('telemetry configuration', () => {
  it('uses a durable default path and accepts explicit paths', () => {
    assert.equal(resolveTelemetryDbPath(), DEFAULT_TELEMETRY_DB_PATH);
    assert.equal(resolveTelemetryDbPath('./usage.sqlite'), path.resolve('./usage.sqlite'));
  });

  it('rejects invalid paths and time zones with safe errors', () => {
    assert.throws(() => resolveTelemetryDbPath('bad\0path'), /invalid character/);
    assert.throws(() => resolveTelemetryTimeZone('Mars/Olympus'), /valid IANA time zone/);
  });

  it('accepts IANA time zone overrides', () => {
    assert.equal(resolveTelemetryTimeZone('America/Sao_Paulo'), 'America/Sao_Paulo');
  });
});
