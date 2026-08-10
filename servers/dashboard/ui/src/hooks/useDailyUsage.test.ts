import { describe, expect, it } from 'vitest';
import { dailyUsageReducer, INITIAL_DAILY_USAGE_STATE } from './useDailyUsage';
import type { UsageComparisonResponse } from '../lib/usage';

const data: UsageComparisonResponse = {
  generatedAt: 1000,
  range: { from: '2026-08-01', to: '2026-08-10', timeZone: 'UTC' },
  products: [],
  daily: [],
};

describe('daily usage request state', () => {
  it('uses an initial loading state before the first success', () => {
    const state = dailyUsageReducer(INITIAL_DAILY_USAGE_STATE, { type: 'request' });
    expect(state.loading).toBe(true);
    expect(state.refreshing).toBe(false);
    expect(state.announcement).toBe('Loading usage history');
  });

  it('retains prior data and marks it stale after a refresh failure', () => {
    const ready = dailyUsageReducer(INITIAL_DAILY_USAGE_STATE, { type: 'success', data, receivedAt: 2000 });
    const refreshing = dailyUsageReducer(ready, { type: 'request' });
    const failed = dailyUsageReducer(refreshing, { type: 'failure', message: 'offline' });
    expect(failed.data).toBe(data);
    expect(failed.stale).toBe(true);
    expect(failed.error).toBe('offline');
  });

  it('clears valid data only after a confirmed reset succeeds', () => {
    const ready = dailyUsageReducer(INITIAL_DAILY_USAGE_STATE, { type: 'success', data, receivedAt: 2000 });
    const resetting = dailyUsageReducer(ready, { type: 'reset-start' });
    expect(resetting.data).toBe(data);
    const cleared = dailyUsageReducer(resetting, { type: 'reset-success' });
    expect(cleared.data).toBeNull();
    expect(cleared.announcement).toBe('Usage history cleared');
  });
});
