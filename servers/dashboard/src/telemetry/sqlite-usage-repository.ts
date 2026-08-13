import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import Database from 'better-sqlite3';
import type {
  ClientTokenUsage,
  CodingAgentProduct,
  TokenUsageCounts,
  TokenUsageMeasurement,
} from '../types';
import { validateTokenUsageMeasurement } from './token-usage';
import { CostEstimator } from './cost-estimator';
import {
  CODING_AGENT_PRODUCTS,
  type CostQuality,
  type PersistUsageInput,
  type PersistUsageResult,
  type ProductUsageRow,
  type TokenUsageRepository,
  type UsageAvailability,
  type UsageComparisonResponse,
} from './usage-repository';

const SCHEMA_VERSION = 1;

interface CursorRow extends TokenUsageCounts {
  capturedAt: number;
}

interface AggregateRow extends TokenUsageCounts {
  measurementCount: number;
  measuredCount: number;
  estimatedCount: number;
  partialCount: number;
  model: string | null;
  lastMeasurementAt: number;
  pricedTokens: number;
  costMicrousd: number;
  reportedCostCount: number;
  estimatedCostCount: number;
}

export interface SqliteUsageRepositoryOptions {
  databasePath: string;
  timeZone: string;
  costEstimator?: CostEstimator;
  now?: () => number;
}

export class SqliteUsageRepository implements TokenUsageRepository {
  readonly timeZone: string;
  private readonly db: Database.Database;
  private readonly costEstimator: CostEstimator;
  private readonly now: () => number;
  private closed = false;

  constructor(options: SqliteUsageRepositoryOptions) {
    validateTimeZone(options.timeZone);
    if (options.databasePath !== ':memory:') {
      fs.mkdirSync(path.dirname(path.resolve(options.databasePath)), { recursive: true });
    }
    this.db = new Database(options.databasePath);
    this.costEstimator = options.costEstimator ?? new CostEstimator();
    this.now = options.now ?? Date.now;
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('busy_timeout = 3000');
    this.db.pragma('journal_mode = WAL');
    this.migrate();

    const pinned = this.db.prepare(
      "SELECT value FROM telemetry_meta WHERE key = 'time_zone'"
    ).get() as { value: string } | undefined;
    if (pinned) {
      validateTimeZone(pinned.value);
      this.timeZone = pinned.value;
    } else {
      this.db.prepare(
        "INSERT INTO telemetry_meta (key, value) VALUES ('time_zone', ?)"
      ).run(options.timeZone);
      this.timeZone = options.timeZone;
    }
  }

  record(input: PersistUsageInput): PersistUsageResult {
    this.assertOpen();
    const measurement = validateTokenUsageMeasurement(input.measurement);
    if (
      !measurement
      || measurement.source !== input.product
      || !isBoundedString(input.sessionId)
      || !isBoundedString(input.cursorKey)
      || !CODING_AGENT_PRODUCTS.includes(input.product)
    ) {
      return { status: 'invalid' };
    }

    const reportedCostMicrousd = input.reportedCostMicrousd
      ?? measurement.reportedCostMicrousd;
    if (
      reportedCostMicrousd !== undefined
      && (!Number.isSafeInteger(reportedCostMicrousd) || reportedCostMicrousd < 0)
    ) {
      return { status: 'invalid' };
    }

    const sessionHash = hashSessionId(input.product, input.sessionId);
    const transact = this.db.transaction((): PersistUsageResult => {
      const reset = this.db.prepare(
        'SELECT reset_at_ms AS resetAt FROM usage_reset_watermarks WHERE product = ?'
      ).get(input.product) as { resetAt: number } | undefined;
      if (reset && measurement.capturedAt <= reset.resetAt) {
        return { status: 'reset-filtered' };
      }

      const duplicate = this.db.prepare(`
        SELECT 1 FROM token_measurements
        WHERE product = ? AND session_hash = ? AND measurement_id = ?
      `).get(input.product, sessionHash, measurement.measurementId);
      if (duplicate) return { status: 'duplicate' };

      const counts = measurementCounts(measurement);
      let delta = counts;
      if (measurement.semantics === 'cumulative') {
        const cursor = this.readCursor(input.product, sessionHash, input.cursorKey);
        if (cursor && measurement.capturedAt <= cursor.capturedAt) {
          return { status: 'stale' };
        }
        if (cursor) delta = subtractCounts(counts, cursor);
      }

      if (!countsAreSafe(delta)) return { status: 'invalid' };
      const existing = this.readAggregate(input.product, sessionHash);
      if (existing && !countsAreSafe(addCounts(existing, delta))) {
        return { status: 'invalid' };
      }

      const localDate = formatLocalDate(measurement.capturedAt, this.timeZone);
      const cost = this.costEstimator.estimate({
        counts: delta,
        localDate,
        model: measurement.model,
        reportedCostMicrousd,
      });

      this.db.prepare(`
        INSERT INTO token_measurements (
          product, session_hash, measurement_id, cursor_key, model,
          captured_at_ms, local_date, quality, partial_coverage,
          delta_input_tokens, delta_output_tokens, delta_cache_read_tokens,
          delta_cache_write_tokens, delta_reasoning_tokens, delta_total_tokens,
          cost_microusd, cost_quality, pricing_version
        ) VALUES (
          @product, @sessionHash, @measurementId, @cursorKey, @model,
          @capturedAt, @localDate, @quality, @partialCoverage,
          @inputTokens, @outputTokens, @cacheReadTokens,
          @cacheWriteTokens, @reasoningTokens, @totalTokens,
          @costMicrousd, @costQuality, @pricingVersion
        )
      `).run({
        product: input.product,
        sessionHash,
        measurementId: measurement.measurementId,
        cursorKey: input.cursorKey,
        model: measurement.model ?? null,
        capturedAt: measurement.capturedAt,
        localDate,
        quality: measurement.quality,
        partialCoverage: measurement.coverage === 'partial' ? 1 : 0,
        ...delta,
        costMicrousd: cost.costMicrousd,
        costQuality: cost.quality,
        pricingVersion: cost.pricingVersion,
      });

      if (measurement.semantics === 'cumulative') {
        this.upsertCursor(input.product, sessionHash, input.cursorKey, measurement);
      }
      this.upsertSession(input.product, sessionHash, measurement, delta);
      this.upsertDaily(input.product, localDate, measurement, delta, cost);

      return {
        status: 'accepted',
        delta,
        sessionUsage: this.getSessionUsageByHash(input.product, sessionHash),
        localDate,
      };
    });
    return transact.immediate();
  }

  getSessionUsage(
    product: CodingAgentProduct,
    sessionId: string
  ): ClientTokenUsage | undefined {
    this.assertOpen();
    if (!isBoundedString(sessionId)) return undefined;
    return this.getSessionUsageByHash(product, hashSessionId(product, sessionId));
  }

  queryDaily(query: { from: string; to: string }): UsageComparisonResponse {
    this.assertOpen();
    if (!isLocalDate(query.from) || !isLocalDate(query.to) || query.from > query.to) {
      throw new Error('Invalid local date range.');
    }
    const rows = this.db.prepare(`
      SELECT
        local_date AS date,
        product,
        input_tokens AS inputTokens,
        output_tokens AS outputTokens,
        cache_read_tokens AS cacheReadTokens,
        cache_write_tokens AS cacheWriteTokens,
        reasoning_tokens AS reasoningTokens,
        total_tokens AS totalTokens,
        measurement_count AS measurementCount,
        measured_count AS measuredCount,
        estimated_count AS estimatedCount,
        partial_count AS partialCount,
        priced_tokens AS pricedTokens,
        cost_microusd AS costMicrousd,
        reported_cost_count AS reportedCostCount,
        estimated_cost_count AS estimatedCostCount,
        last_measurement_at_ms AS lastMeasurementAt,
        NULL AS model
      FROM daily_usage
      WHERE local_date BETWEEN ? AND ?
      ORDER BY local_date ASC, product ASC
    `).all(query.from, query.to) as Array<AggregateRow & {
      product: CodingAgentProduct;
      date: string;
    }>;

    const daily = rows.map((row) => presentAggregate(row, row.product, row.date));
    const products = CODING_AGENT_PRODUCTS.map((product) => {
      const matches = rows.filter((row) => row.product === product);
      if (matches.length === 0) return unavailableRow(product, null);
      return presentAggregate(sumAggregates(matches), product, null);
    });

    return {
      generatedAt: this.now(),
      range: { from: query.from, to: query.to, timeZone: this.timeZone },
      products,
      daily,
    };
  }

  getOldestUsageDate(): string | undefined {
    this.assertOpen();
    const row = this.db.prepare(
      'SELECT MIN(local_date) AS date FROM daily_usage'
    ).get() as { date: string | null };
    return row.date ?? undefined;
  }

  reset(
    products: CodingAgentProduct[] = [...CODING_AGENT_PRODUCTS],
    at: number = this.now()
  ): { deletedMeasurements: number } {
    this.assertOpen();
    const uniqueProducts = [...new Set(products)];
    if (
      uniqueProducts.length === 0
      || uniqueProducts.some((product) => !CODING_AGENT_PRODUCTS.includes(product))
      || !Number.isSafeInteger(at)
      || at < 0
    ) {
      throw new Error('Invalid usage reset request.');
    }

    const transact = this.db.transaction(() => {
      const placeholders = uniqueProducts.map(() => '?').join(', ');
      const deleted = this.db.prepare(
        `DELETE FROM token_measurements WHERE product IN (${placeholders})`
      ).run(...uniqueProducts).changes;
      this.db.prepare(
        `DELETE FROM session_usage WHERE product IN (${placeholders})`
      ).run(...uniqueProducts);
      this.db.prepare(
        `DELETE FROM daily_usage WHERE product IN (${placeholders})`
      ).run(...uniqueProducts);
      const watermark = this.db.prepare(`
        INSERT INTO usage_reset_watermarks (product, reset_at_ms)
        VALUES (?, ?)
        ON CONFLICT(product) DO UPDATE SET
          reset_at_ms = MAX(reset_at_ms, excluded.reset_at_ms)
      `);
      for (const product of uniqueProducts) watermark.run(product, at);
      return { deletedMeasurements: deleted };
    });
    return transact.immediate();
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    if (this.db.open) {
      this.db.pragma('wal_checkpoint(TRUNCATE)');
      this.db.close();
    }
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at_ms INTEGER NOT NULL
      );
    `);
    const current = this.db.prepare(
      'SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations'
    ).get() as { version: number };
    if (current.version >= SCHEMA_VERSION) return;

    const migrate = this.db.transaction(() => {
      this.db.exec(`
        CREATE TABLE telemetry_meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
        CREATE TABLE token_cursors (
          product TEXT NOT NULL,
          session_hash TEXT NOT NULL,
          cursor_key TEXT NOT NULL,
          captured_at_ms INTEGER NOT NULL,
          input_tokens INTEGER NOT NULL,
          output_tokens INTEGER NOT NULL,
          cache_read_tokens INTEGER NOT NULL,
          cache_write_tokens INTEGER NOT NULL,
          reasoning_tokens INTEGER NOT NULL,
          total_tokens INTEGER NOT NULL,
          PRIMARY KEY (product, session_hash, cursor_key)
        );
        CREATE TABLE token_measurements (
          id INTEGER PRIMARY KEY,
          product TEXT NOT NULL,
          session_hash TEXT NOT NULL,
          measurement_id TEXT NOT NULL,
          cursor_key TEXT NOT NULL,
          model TEXT,
          captured_at_ms INTEGER NOT NULL,
          local_date TEXT NOT NULL,
          quality TEXT NOT NULL,
          partial_coverage INTEGER NOT NULL DEFAULT 0,
          delta_input_tokens INTEGER NOT NULL,
          delta_output_tokens INTEGER NOT NULL,
          delta_cache_read_tokens INTEGER NOT NULL,
          delta_cache_write_tokens INTEGER NOT NULL,
          delta_reasoning_tokens INTEGER NOT NULL,
          delta_total_tokens INTEGER NOT NULL,
          cost_microusd INTEGER,
          cost_quality TEXT NOT NULL,
          pricing_version TEXT,
          UNIQUE (product, session_hash, measurement_id)
        );
        CREATE TABLE session_usage (
          product TEXT NOT NULL,
          session_hash TEXT NOT NULL,
          model TEXT,
          input_tokens INTEGER NOT NULL,
          output_tokens INTEGER NOT NULL,
          cache_read_tokens INTEGER NOT NULL,
          cache_write_tokens INTEGER NOT NULL,
          reasoning_tokens INTEGER NOT NULL,
          total_tokens INTEGER NOT NULL,
          measurement_count INTEGER NOT NULL,
          measured_count INTEGER NOT NULL,
          estimated_count INTEGER NOT NULL,
          partial_count INTEGER NOT NULL,
          last_measurement_at_ms INTEGER NOT NULL,
          PRIMARY KEY (product, session_hash)
        );
        CREATE TABLE daily_usage (
          local_date TEXT NOT NULL,
          product TEXT NOT NULL,
          input_tokens INTEGER NOT NULL,
          output_tokens INTEGER NOT NULL,
          cache_read_tokens INTEGER NOT NULL,
          cache_write_tokens INTEGER NOT NULL,
          reasoning_tokens INTEGER NOT NULL,
          total_tokens INTEGER NOT NULL,
          measurement_count INTEGER NOT NULL,
          measured_count INTEGER NOT NULL,
          estimated_count INTEGER NOT NULL,
          partial_count INTEGER NOT NULL,
          priced_tokens INTEGER NOT NULL,
          cost_microusd INTEGER NOT NULL,
          reported_cost_count INTEGER NOT NULL,
          estimated_cost_count INTEGER NOT NULL,
          last_measurement_at_ms INTEGER NOT NULL,
          PRIMARY KEY (local_date, product)
        );
        CREATE TABLE usage_reset_watermarks (
          product TEXT PRIMARY KEY,
          reset_at_ms INTEGER NOT NULL
        );
        CREATE INDEX token_measurements_date_product
          ON token_measurements(local_date, product);
        CREATE INDEX token_measurements_product_captured
          ON token_measurements(product, captured_at_ms);
        CREATE INDEX token_measurements_session_captured
          ON token_measurements(product, session_hash, captured_at_ms);
      `);
      this.db.prepare(
        'INSERT INTO schema_migrations (version, applied_at_ms) VALUES (?, ?)'
      ).run(SCHEMA_VERSION, this.now());
    });
    migrate.immediate();
  }

  private readCursor(
    product: CodingAgentProduct,
    sessionHash: string,
    cursorKey: string
  ): CursorRow | undefined {
    return this.db.prepare(`
      SELECT
        captured_at_ms AS capturedAt,
        input_tokens AS inputTokens,
        output_tokens AS outputTokens,
        cache_read_tokens AS cacheReadTokens,
        cache_write_tokens AS cacheWriteTokens,
        reasoning_tokens AS reasoningTokens,
        total_tokens AS totalTokens
      FROM token_cursors
      WHERE product = ? AND session_hash = ? AND cursor_key = ?
    `).get(product, sessionHash, cursorKey) as CursorRow | undefined;
  }

  private upsertCursor(
    product: CodingAgentProduct,
    sessionHash: string,
    cursorKey: string,
    measurement: TokenUsageMeasurement
  ): void {
    this.db.prepare(`
      INSERT INTO token_cursors (
        product, session_hash, cursor_key, captured_at_ms,
        input_tokens, output_tokens, cache_read_tokens, cache_write_tokens,
        reasoning_tokens, total_tokens
      ) VALUES (
        @product, @sessionHash, @cursorKey, @capturedAt,
        @inputTokens, @outputTokens, @cacheReadTokens, @cacheWriteTokens,
        @reasoningTokens, @totalTokens
      )
      ON CONFLICT(product, session_hash, cursor_key) DO UPDATE SET
        captured_at_ms = excluded.captured_at_ms,
        input_tokens = excluded.input_tokens,
        output_tokens = excluded.output_tokens,
        cache_read_tokens = excluded.cache_read_tokens,
        cache_write_tokens = excluded.cache_write_tokens,
        reasoning_tokens = excluded.reasoning_tokens,
        total_tokens = excluded.total_tokens
    `).run({ ...measurement, product, sessionHash, cursorKey });
  }

  private upsertSession(
    product: CodingAgentProduct,
    sessionHash: string,
    measurement: TokenUsageMeasurement,
    delta: TokenUsageCounts
  ): void {
    this.db.prepare(`
      INSERT INTO session_usage (
        product, session_hash, model,
        input_tokens, output_tokens, cache_read_tokens, cache_write_tokens,
        reasoning_tokens, total_tokens, measurement_count, measured_count,
        estimated_count, partial_count, last_measurement_at_ms
      ) VALUES (
        @product, @sessionHash, @model,
        @inputTokens, @outputTokens, @cacheReadTokens, @cacheWriteTokens,
        @reasoningTokens, @totalTokens, 1, @measuredCount,
        @estimatedCount, @partialCount, @capturedAt
      )
      ON CONFLICT(product, session_hash) DO UPDATE SET
        model = COALESCE(excluded.model, session_usage.model),
        input_tokens = session_usage.input_tokens + excluded.input_tokens,
        output_tokens = session_usage.output_tokens + excluded.output_tokens,
        cache_read_tokens = session_usage.cache_read_tokens + excluded.cache_read_tokens,
        cache_write_tokens = session_usage.cache_write_tokens + excluded.cache_write_tokens,
        reasoning_tokens = session_usage.reasoning_tokens + excluded.reasoning_tokens,
        total_tokens = session_usage.total_tokens + excluded.total_tokens,
        measurement_count = session_usage.measurement_count + 1,
        measured_count = session_usage.measured_count + excluded.measured_count,
        estimated_count = session_usage.estimated_count + excluded.estimated_count,
        partial_count = session_usage.partial_count + excluded.partial_count,
        last_measurement_at_ms = MAX(session_usage.last_measurement_at_ms, excluded.last_measurement_at_ms)
    `).run({
      product,
      sessionHash,
      model: measurement.model ?? null,
      ...delta,
      measuredCount: measurement.quality === 'measured' ? 1 : 0,
      estimatedCount: measurement.quality === 'estimated' ? 1 : 0,
      partialCount: measurement.coverage === 'partial' ? 1 : 0,
      capturedAt: measurement.capturedAt,
    });
  }

  private upsertDaily(
    product: CodingAgentProduct,
    localDate: string,
    measurement: TokenUsageMeasurement,
    delta: TokenUsageCounts,
    cost: ReturnType<CostEstimator['estimate']>
  ): void {
    this.db.prepare(`
      INSERT INTO daily_usage (
        local_date, product,
        input_tokens, output_tokens, cache_read_tokens, cache_write_tokens,
        reasoning_tokens, total_tokens, measurement_count, measured_count,
        estimated_count, partial_count, priced_tokens, cost_microusd,
        reported_cost_count, estimated_cost_count, last_measurement_at_ms
      ) VALUES (
        @localDate, @product,
        @inputTokens, @outputTokens, @cacheReadTokens, @cacheWriteTokens,
        @reasoningTokens, @totalTokens, 1, @measuredCount,
        @estimatedCount, @partialCount, @pricedTokens, @costMicrousd,
        @reportedCostCount, @estimatedCostCount, @capturedAt
      )
      ON CONFLICT(local_date, product) DO UPDATE SET
        input_tokens = daily_usage.input_tokens + excluded.input_tokens,
        output_tokens = daily_usage.output_tokens + excluded.output_tokens,
        cache_read_tokens = daily_usage.cache_read_tokens + excluded.cache_read_tokens,
        cache_write_tokens = daily_usage.cache_write_tokens + excluded.cache_write_tokens,
        reasoning_tokens = daily_usage.reasoning_tokens + excluded.reasoning_tokens,
        total_tokens = daily_usage.total_tokens + excluded.total_tokens,
        measurement_count = daily_usage.measurement_count + 1,
        measured_count = daily_usage.measured_count + excluded.measured_count,
        estimated_count = daily_usage.estimated_count + excluded.estimated_count,
        partial_count = daily_usage.partial_count + excluded.partial_count,
        priced_tokens = daily_usage.priced_tokens + excluded.priced_tokens,
        cost_microusd = daily_usage.cost_microusd + excluded.cost_microusd,
        reported_cost_count = daily_usage.reported_cost_count + excluded.reported_cost_count,
        estimated_cost_count = daily_usage.estimated_cost_count + excluded.estimated_cost_count,
        last_measurement_at_ms = MAX(daily_usage.last_measurement_at_ms, excluded.last_measurement_at_ms)
    `).run({
      localDate,
      product,
      ...delta,
      measuredCount: measurement.quality === 'measured' ? 1 : 0,
      estimatedCount: measurement.quality === 'estimated' ? 1 : 0,
      partialCount: measurement.coverage === 'partial' ? 1 : 0,
      pricedTokens: cost.pricedTokens,
      costMicrousd: cost.costMicrousd ?? 0,
      reportedCostCount: cost.quality === 'reported' ? 1 : 0,
      estimatedCostCount: cost.quality === 'estimated' ? 1 : 0,
      capturedAt: measurement.capturedAt,
    });
  }

  private readAggregate(
    product: CodingAgentProduct,
    sessionHash: string
  ): AggregateRow | undefined {
    return this.db.prepare(`
      SELECT
        input_tokens AS inputTokens,
        output_tokens AS outputTokens,
        cache_read_tokens AS cacheReadTokens,
        cache_write_tokens AS cacheWriteTokens,
        reasoning_tokens AS reasoningTokens,
        total_tokens AS totalTokens,
        measurement_count AS measurementCount,
        measured_count AS measuredCount,
        estimated_count AS estimatedCount,
        partial_count AS partialCount,
        model,
        last_measurement_at_ms AS lastMeasurementAt,
        0 AS pricedTokens,
        0 AS costMicrousd,
        0 AS reportedCostCount,
        0 AS estimatedCostCount
      FROM session_usage
      WHERE product = ? AND session_hash = ?
    `).get(product, sessionHash) as AggregateRow | undefined;
  }

  private getSessionUsageByHash(
    product: CodingAgentProduct,
    sessionHash: string
  ): ClientTokenUsage | undefined {
    const row = this.readAggregate(product, sessionHash);
    if (!row) return undefined;
    return {
      inputTokens: row.inputTokens,
      outputTokens: row.outputTokens,
      cacheReadTokens: row.cacheReadTokens,
      cacheWriteTokens: row.cacheWriteTokens,
      reasoningTokens: row.reasoningTokens,
      totalTokens: row.totalTokens,
      quality: row.estimatedCount > 0 && row.measuredCount === 0 ? 'estimated' : 'measured',
      model: row.model ?? undefined,
      measurementCount: row.measurementCount,
      rejectedMeasurementCount: 0,
    };
  }

  private assertOpen(): void {
    if (this.closed) throw new Error('Usage repository is closed.');
  }
}

function hashSessionId(product: CodingAgentProduct, sessionId: string): string {
  return createHash('sha256').update(`${product}\0${sessionId}`).digest('hex');
}

function validateTimeZone(timeZone: string): void {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(0);
  } catch {
    throw new Error('Invalid telemetry time zone.');
  }
}

export function formatLocalDate(timestamp: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(timestamp);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function isLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function isBoundedString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 200;
}

function measurementCounts(measurement: TokenUsageMeasurement): TokenUsageCounts {
  return {
    inputTokens: measurement.inputTokens,
    outputTokens: measurement.outputTokens,
    cacheReadTokens: measurement.cacheReadTokens,
    cacheWriteTokens: measurement.cacheWriteTokens,
    reasoningTokens: measurement.reasoningTokens,
    totalTokens: measurement.totalTokens,
  };
}

function subtractCounts(current: TokenUsageCounts, previous: TokenUsageCounts): TokenUsageCounts {
  if (current.totalTokens < previous.totalTokens) return { ...current };
  return {
    inputTokens: Math.max(0, current.inputTokens - previous.inputTokens),
    outputTokens: Math.max(0, current.outputTokens - previous.outputTokens),
    cacheReadTokens: Math.max(0, current.cacheReadTokens - previous.cacheReadTokens),
    cacheWriteTokens: Math.max(0, current.cacheWriteTokens - previous.cacheWriteTokens),
    reasoningTokens: Math.max(0, current.reasoningTokens - previous.reasoningTokens),
    totalTokens: current.totalTokens - previous.totalTokens,
  };
}

function addCounts(left: TokenUsageCounts, right: TokenUsageCounts): TokenUsageCounts {
  return {
    inputTokens: left.inputTokens + right.inputTokens,
    outputTokens: left.outputTokens + right.outputTokens,
    cacheReadTokens: left.cacheReadTokens + right.cacheReadTokens,
    cacheWriteTokens: left.cacheWriteTokens + right.cacheWriteTokens,
    reasoningTokens: left.reasoningTokens + right.reasoningTokens,
    totalTokens: left.totalTokens + right.totalTokens,
  };
}

function countsAreSafe(counts: TokenUsageCounts): boolean {
  return Object.values(counts).every(
    (value) => Number.isSafeInteger(value) && value >= 0
  );
}

function sumAggregates(rows: AggregateRow[]): AggregateRow {
  const first = rows[0];
  return rows.slice(1).reduce((sum, row) => ({
    ...sum,
    ...addCounts(sum, row),
    measurementCount: sum.measurementCount + row.measurementCount,
    measuredCount: sum.measuredCount + row.measuredCount,
    estimatedCount: sum.estimatedCount + row.estimatedCount,
    partialCount: sum.partialCount + row.partialCount,
    pricedTokens: sum.pricedTokens + row.pricedTokens,
    costMicrousd: sum.costMicrousd + row.costMicrousd,
    reportedCostCount: sum.reportedCostCount + row.reportedCostCount,
    estimatedCostCount: sum.estimatedCostCount + row.estimatedCostCount,
    lastMeasurementAt: Math.max(sum.lastMeasurementAt, row.lastMeasurementAt),
  }), { ...first });
}

function presentAggregate(
  row: AggregateRow,
  product: CodingAgentProduct,
  date: string | null
): ProductUsageRow {
  const tokenUsage: TokenUsageCounts = {
    inputTokens: row.inputTokens,
    outputTokens: row.outputTokens,
    cacheReadTokens: row.cacheReadTokens,
    cacheWriteTokens: row.cacheWriteTokens,
    reasoningTokens: row.reasoningTokens,
    totalTokens: row.totalTokens,
  };
  return {
    product,
    date,
    tokenUsage,
    availability: availability(row),
    measurementCount: row.measurementCount,
    estimatedCostUsd: row.reportedCostCount + row.estimatedCostCount > 0
      ? row.costMicrousd / 1_000_000
      : null,
    costQuality: costQuality(row),
    pricedTokens: row.pricedTokens,
    totalTokens: row.totalTokens,
    lastMeasurementAt: row.lastMeasurementAt,
  };
}

function availability(row: AggregateRow): UsageAvailability {
  return row.partialCount > 0 ? 'partial' : 'measured';
}

function costQuality(row: AggregateRow): CostQuality {
  const pricedMeasurements = row.reportedCostCount + row.estimatedCostCount;
  if (pricedMeasurements === 0) return 'unavailable';
  if (
    row.pricedTokens < row.totalTokens
    || (row.reportedCostCount > 0 && row.estimatedCostCount > 0)
  ) return 'mixed';
  return row.reportedCostCount > 0 ? 'reported' : 'estimated';
}

function unavailableRow(
  product: CodingAgentProduct,
  date: string | null
): ProductUsageRow {
  return {
    product,
    date,
    tokenUsage: null,
    availability: 'unavailable',
    measurementCount: 0,
    estimatedCostUsd: null,
    costQuality: 'unavailable',
    pricedTokens: 0,
    totalTokens: null,
    lastMeasurementAt: null,
  };
}
