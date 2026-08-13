import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import type { TokenUsageMeasurement } from '../types';
import { CostEstimator } from './cost-estimator';
import { SqliteUsageRepository } from './sqlite-usage-repository';

const cleanup: string[] = [];

afterEach(() => {
  for (const target of cleanup.splice(0)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

function tempDatabase(): { directory: string; databasePath: string } {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-usage-'));
  cleanup.push(directory);
  return { directory, databasePath: path.join(directory, 'telemetry.sqlite') };
}

function measurement(
  id: string,
  capturedAt: number,
  totalTokens: number,
  overrides: Partial<TokenUsageMeasurement> = {}
): TokenUsageMeasurement {
  return {
    inputTokens: totalTokens,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
    totalTokens,
    measurementId: id,
    capturedAt,
    source: 'codex',
    quality: 'measured',
    semantics: 'cumulative',
    ...overrides,
  };
}

function record(
  repository: SqliteUsageRepository,
  value: TokenUsageMeasurement,
  sessionId = 'session-private'
) {
  return repository.record({
    product: value.source === 'log-watcher' ? 'codex' : value.source,
    sessionId,
    cursorKey: value.cursorKey ?? 'stream-1',
    measurement: value,
  });
}

describe('SqliteUsageRepository', () => {
  it('migrates in WAL mode and pins the creation time zone', () => {
    const { databasePath } = tempDatabase();
    const repository = new SqliteUsageRepository({ databasePath, timeZone: 'UTC' });
    repository.close();

    const database = new Database(databasePath, { readonly: true });
    assert.equal(database.pragma('journal_mode', { simple: true }), 'wal');
    assert.equal(
      (database.prepare("SELECT value FROM telemetry_meta WHERE key = 'time_zone'").get() as { value: string }).value,
      'UTC'
    );
    database.close();

    const reopened = new SqliteUsageRepository({
      databasePath,
      timeZone: 'America/Sao_Paulo',
    });
    assert.equal(reopened.timeZone, 'UTC');
    reopened.close();
    reopened.close();
  });

  it('deduplicates replays, rejects stale counters, and survives reopen', () => {
    const { databasePath } = tempDatabase();
    let repository = new SqliteUsageRepository({ databasePath, timeZone: 'UTC' });
    const first = measurement('m-1', Date.parse('2026-08-10T10:00:00Z'), 100);
    const second = measurement('m-2', Date.parse('2026-08-10T11:00:00Z'), 160);

    assert.equal(record(repository, first).status, 'accepted');
    assert.equal(record(repository, first).status, 'duplicate');
    assert.equal(record(repository, second).delta?.totalTokens, 60);
    assert.equal(
      record(repository, measurement('m-old', first.capturedAt + 1, 120)).status,
      'stale'
    );
    repository.close();

    repository = new SqliteUsageRepository({ databasePath, timeZone: 'UTC' });
    assert.equal(record(repository, second).status, 'duplicate');
    assert.equal(repository.getSessionUsage('codex', 'session-private')?.totalTokens, 160);
    const response = repository.queryDaily({ from: '2026-08-10', to: '2026-08-10' });
    assert.equal(response.products.find((row) => row.product === 'codex')?.totalTokens, 160);
    assert.equal(response.products.find((row) => row.product === 'kimi')?.tokenUsage, null);
    repository.close();
  });

  it('attributes deltas to pinned local dates across midnight and DST', () => {
    const repository = new SqliteUsageRepository({
      databasePath: tempDatabase().databasePath,
      timeZone: 'America/New_York',
    });
    const moments = [
      Date.parse('2026-11-01T03:30:00Z'),
      Date.parse('2026-11-01T05:30:00Z'),
      Date.parse('2026-11-01T06:30:00Z'),
    ];
    moments.forEach((capturedAt, index) => {
      record(repository, measurement(`m-${index}`, capturedAt, 10, { semantics: 'delta' }));
    });

    const response = repository.queryDaily({ from: '2026-10-31', to: '2026-11-01' });
    assert.deepEqual(
      response.daily.map((row) => [row.date, row.totalTokens]),
      [['2026-10-31', 10], ['2026-11-01', 20]]
    );
    repository.close();
  });

  it('keeps cumulative cursors across reset without restoring old history', () => {
    const repository = new SqliteUsageRepository({
      databasePath: tempDatabase().databasePath,
      timeZone: 'UTC',
    });
    assert.equal(record(repository, measurement('before', 1_000, 100)).status, 'accepted');
    assert.deepEqual(repository.reset(['codex'], 2_000), { deletedMeasurements: 1 });
    assert.equal(record(repository, measurement('filtered', 1_500, 130)).status, 'reset-filtered');
    const accepted = record(repository, measurement('after', 3_000, 150));
    assert.equal(accepted.status, 'accepted');
    assert.equal(accepted.delta?.totalTokens, 50);
    assert.equal(repository.getSessionUsage('codex', 'session-private')?.totalTokens, 50);
    repository.close();
  });

  it('keeps independent Kimi wire cursors when a partial read omits another stream', () => {
    const repository = new SqliteUsageRepository({
      databasePath: tempDatabase().databasePath,
      timeZone: 'UTC',
    });
    const wireA = (id: string, capturedAt: number, totalTokens: number, coverage: 'complete' | 'partial' = 'complete') => measurement(
      id,
      capturedAt,
      totalTokens,
      { source: 'kimi', cursorKey: 'kimi:wire:a', coverage }
    );
    const wireB = measurement('wire-b-1', 2_000, 100, {
      source: 'kimi',
      cursorKey: 'kimi:wire:b',
    });

    assert.equal(record(repository, wireA('wire-a-1', 1_000, 100)).status, 'accepted');
    assert.equal(record(repository, wireB).status, 'accepted');
    const advanced = record(repository, wireA('wire-a-2', 1_500, 150, 'partial'));
    assert.equal(advanced.delta?.totalTokens, 50);
    assert.equal(repository.getSessionUsage('kimi', 'session-private')?.totalTokens, 250);
    const product = repository.queryDaily({ from: '1970-01-01', to: '1970-01-01' })
      .products.find((row) => row.product === 'kimi');
    assert.equal(product?.availability, 'partial');
    assert.equal(product?.totalTokens, 250);
    repository.close();
  });

  it('surfaces partial telemetry and mixed immutable cost coverage', () => {
    const repository = new SqliteUsageRepository({
      databasePath: tempDatabase().databasePath,
      timeZone: 'UTC',
    });
    const at = Date.parse('2026-08-10T12:00:00Z');
    record(repository, measurement('priced', at, 100, {
      semantics: 'delta',
      model: 'gpt-5.6-luna',
      coverage: 'partial',
    }));
    record(repository, measurement('unknown', at + 1, 100, {
      semantics: 'delta',
      model: 'unknown',
    }));
    const codex = repository.queryDaily({
      from: '2026-08-10',
      to: '2026-08-10',
    }).products.find((row) => row.product === 'codex');
    assert.equal(codex?.availability, 'partial');
    assert.equal(codex?.costQuality, 'mixed');
    assert.equal(codex?.pricedTokens, 100);
    assert.equal(codex?.totalTokens, 200);
    repository.close();
  });

  it('rolls back every usage table when cost calculation fails', () => {
    const estimator = {
      estimate: () => {
        throw new Error('forced estimate failure');
      },
    } as unknown as CostEstimator;
    const repository = new SqliteUsageRepository({
      databasePath: tempDatabase().databasePath,
      timeZone: 'UTC',
      costEstimator: estimator,
    });
    assert.throws(() => record(repository, measurement('m-1', 1_000, 100)), /forced/);
    assert.equal(repository.getSessionUsage('codex', 'session-private'), undefined);
    assert.equal(repository.getOldestUsageDate(), undefined);
    repository.close();
  });

  it('persists only a one-way session hash', () => {
    const { databasePath } = tempDatabase();
    const repository = new SqliteUsageRepository({ databasePath, timeZone: 'UTC' });
    record(repository, measurement('m-1', 1_000, 100), 'secret/session/path');
    repository.close();
    const database = new Database(databasePath, { readonly: true });
    const textValues = database.prepare(`
      SELECT session_hash AS sessionHash, measurement_id AS measurementId,
        cursor_key AS cursorKey, model
      FROM token_measurements
    `).all() as Array<Record<string, unknown>>;
    assert.equal(JSON.stringify(textValues).includes('secret/session/path'), false);
    assert.match(String(textValues[0].sessionHash), /^[a-f0-9]{64}$/);
    database.close();
  });
});
