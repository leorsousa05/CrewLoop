import { useState, useEffect, useCallback } from 'react';
import type { ClientSecurityDecision } from '../../../src/types';

export interface SecurityData {
  decisions: ClientSecurityDecision[];
  loading: boolean;
  error: string | null;
}

export function useSecurity(
  sessionId: string | null,
  initialDecisions: ClientSecurityDecision[] = []
): SecurityData {
  const [decisions, setDecisions] = useState<ClientSecurityDecision[]>(initialDecisions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDecisions = useCallback(async () => {
    if (!sessionId) {
      setDecisions([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/security?sessionId=${encodeURIComponent(sessionId)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setDecisions(data.decisions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security decisions');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    setDecisions(initialDecisions);
  }, [initialDecisions]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  return { decisions, loading, error };
}
