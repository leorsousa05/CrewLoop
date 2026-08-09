import { useState, useEffect, useCallback, useRef } from 'react';
import type { ClientSecurityDecision } from '../../../src/types';
import type { ClientConfirmationRequest } from '../lib/types';

export interface SecurityData {
  decisions: ClientSecurityDecision[];
  pendingConfirmations: ClientConfirmationRequest[];
  loading: boolean;
  error: string | null;
  approveConfirmation(id: string, remember?: boolean): Promise<void>;
  denyConfirmation(id: string, remember?: boolean): Promise<void>;
}

export function useSecurity(
  sessionId: string | null,
  initialDecisions: ClientSecurityDecision[] = [],
  initialPendingConfirmations: ClientConfirmationRequest[] = []
): SecurityData {
  const [decisions, setDecisions] = useState<ClientSecurityDecision[]>(initialDecisions);
  const [pendingConfirmations, setPendingConfirmations] = useState<ClientConfirmationRequest[]>(
    initialPendingConfirmations
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousSessionIdRef.current !== sessionId) {
      previousSessionIdRef.current = sessionId;
      setDecisions(initialDecisions);
      setPendingConfirmations(
        initialPendingConfirmations.filter((c) => c.status === 'pending')
      );
    }
  }, [sessionId, initialDecisions, initialPendingConfirmations]);

  const fetchDecisions = useCallback(async () => {
    if (!sessionId) {
      setDecisions([]);
      setPendingConfirmations([]);
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
      setPendingConfirmations(
        (data.pendingConfirmations || []).filter(
          (c: ClientConfirmationRequest) => c.status === 'pending'
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security decisions');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const approveConfirmation = useCallback(
    async (id: string, remember?: boolean) => {
      if (!sessionId) {
        throw new Error('No session selected');
      }
      const body: Record<string, unknown> = {};
      if (remember !== undefined) {
        body.remember = remember;
      }
      const res = await fetch(`/api/security/confirmations/${encodeURIComponent(id)}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      await fetchDecisions();
    },
    [sessionId, fetchDecisions]
  );

  const denyConfirmation = useCallback(
    async (id: string, remember?: boolean) => {
      if (!sessionId) {
        throw new Error('No session selected');
      }
      const body: Record<string, unknown> = {};
      if (remember !== undefined) {
        body.remember = remember;
      }
      const res = await fetch(`/api/security/confirmations/${encodeURIComponent(id)}/deny`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      await fetchDecisions();
    },
    [sessionId, fetchDecisions]
  );

  return {
    decisions,
    pendingConfirmations,
    loading,
    error,
    approveConfirmation,
    denyConfirmation,
  };
}
