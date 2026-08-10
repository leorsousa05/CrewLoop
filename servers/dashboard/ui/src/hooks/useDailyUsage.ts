import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { UsageRange } from '../lib/types';
import {
  buildDailyUsageUrl,
  parseUsageComparisonResponse,
  type CodingAgentProduct,
  type UsageComparisonResponse,
} from '../lib/usage';

export interface DailyUsageState {
  data: UsageComparisonResponse | null;
  loading: boolean;
  refreshing: boolean;
  stale: boolean;
  error: string | null;
  lastSuccessAt: number | null;
  announcement: string;
  resetting: boolean;
  resetError: string | null;
}

export type DailyUsageAction =
  | { type: 'request' }
  | { type: 'success'; data: UsageComparisonResponse; receivedAt: number }
  | { type: 'failure'; message: string }
  | { type: 'reset-start' }
  | { type: 'reset-success' }
  | { type: 'reset-failure'; message: string }
  | { type: 'clear-reset-error' };

export const INITIAL_DAILY_USAGE_STATE: DailyUsageState = {
  data: null,
  loading: false,
  refreshing: false,
  stale: false,
  error: null,
  lastSuccessAt: null,
  announcement: '',
  resetting: false,
  resetError: null,
};

export function dailyUsageReducer(state: DailyUsageState, action: DailyUsageAction): DailyUsageState {
  switch (action.type) {
    case 'request':
      return {
        ...state,
        loading: state.data === null,
        refreshing: state.data !== null,
        stale: false,
        error: null,
        announcement: state.data === null ? 'Loading usage history' : 'Refreshing usage history',
      };
    case 'success':
      return {
        ...state,
        data: action.data,
        loading: false,
        refreshing: false,
        stale: false,
        error: null,
        lastSuccessAt: action.receivedAt,
        announcement: 'Usage history updated',
      };
    case 'failure':
      return {
        ...state,
        loading: false,
        refreshing: false,
        stale: state.data !== null,
        error: action.message,
        announcement: state.data === null ? 'Usage history could not be loaded' : 'Usage history refresh failed; showing stale data',
      };
    case 'reset-start':
      return { ...state, resetting: true, resetError: null, announcement: 'Clearing usage history' };
    case 'reset-success':
      return {
        ...state,
        data: null,
        resetting: false,
        resetError: null,
        stale: false,
        error: null,
        announcement: 'Usage history cleared',
      };
    case 'reset-failure':
      return { ...state, resetting: false, resetError: action.message, announcement: 'Usage history could not be cleared' };
    case 'clear-reset-error':
      return { ...state, resetError: null };
  }
}

function safeMessage(response: Response, fallback: string): Promise<string> {
  return response.json()
    .then((body: unknown) => {
      if (typeof body === 'object' && body !== null && 'error' in body && typeof (body as { error?: unknown }).error === 'string') {
        return (body as { error: string }).error;
      }
      return fallback;
    })
    .catch(() => fallback);
}

export interface DailyUsageController extends DailyUsageState {
  refresh(): void;
  reset(products?: CodingAgentProduct[]): Promise<boolean>;
  clearResetError(): void;
}

export function useDailyUsage(range: UsageRange): DailyUsageController {
  const [state, dispatch] = useReducer(dailyUsageReducer, INITIAL_DAILY_USAGE_STATE);
  const stateRef = useRef(state);
  const requestRef = useRef<AbortController | null>(null);
  const requestSequence = useRef(0);
  stateRef.current = state;

  const load = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const sequence = ++requestSequence.current;
    dispatch({ type: 'request' });
    try {
      const url = buildDailyUsageUrl(range, {
        timeZone: stateRef.current.data?.range.timeZone,
      });
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(await safeMessage(response, 'Usage history could not be loaded.'));
      const parsed = parseUsageComparisonResponse(await response.json());
      if (!parsed) throw new Error('Usage history returned an invalid response.');
      if (sequence === requestSequence.current) {
        dispatch({ type: 'success', data: parsed, receivedAt: Date.now() });
      }
    } catch (error) {
      if (controller.signal.aborted || sequence !== requestSequence.current) return;
      dispatch({
        type: 'failure',
        message: error instanceof Error ? error.message : 'Usage history could not be loaded.',
      });
    }
  }, [range]);

  useEffect(() => {
    void load();
    return () => requestRef.current?.abort();
  }, [load]);

  const reset = useCallback(async (products?: CodingAgentProduct[]): Promise<boolean> => {
    dispatch({ type: 'reset-start' });
    try {
      const response = await fetch('/api/usage/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ products, confirmation: 'RESET' }),
      });
      if (!response.ok) throw new Error(await safeMessage(response, 'Usage history could not be cleared.'));
      dispatch({ type: 'reset-success' });
      void load();
      return true;
    } catch (error) {
      dispatch({
        type: 'reset-failure',
        message: error instanceof Error ? error.message : 'Usage history could not be cleared.',
      });
      return false;
    }
  }, [load]);

  const clearResetError = useCallback(() => dispatch({ type: 'clear-reset-error' }), []);

  return { ...state, refresh: () => void load(), reset, clearResetError };
}
