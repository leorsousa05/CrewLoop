import { useCallback, useState } from 'react';
import type { ClientSession, ClientWebSocketMessage } from '../../../src/types';

export interface SessionsState {
  sessions: Map<string, ClientSession>;
  selectedSessionId: string | null;
}

function defaultSelected(
  sessions: Map<string, ClientSession>,
  activeSessionId: string | undefined,
  current: string | null
): string | null {
  if (current && sessions.has(current)) return current;
  if (activeSessionId && sessions.has(activeSessionId)) return activeSessionId;
  const first = sessions.keys().next().value;
  return first || null;
}

export function useSessions() {
  const [state, setState] = useState<SessionsState>({
    sessions: new Map(),
    selectedSessionId: null,
  });

  const selectSession = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedSessionId: id }));
  }, []);

  const handleMessage = useCallback((msg: ClientWebSocketMessage) => {
    setState((prev) => {
      const sessions = new Map(prev.sessions);
      let activeSessionId: string | undefined;

      if (msg.type === 'snapshot') {
        sessions.clear();
        for (const s of msg.sessions) {
          sessions.set(s.id, s);
        }
      } else if (msg.type === 'update') {
        const s = msg.session;
        sessions.set(s.id, s);
        if (msg.isActive) activeSessionId = s.id;
      }

      return {
        sessions,
        selectedSessionId: defaultSelected(sessions, activeSessionId, prev.selectedSessionId),
      };
    });
  }, []);

  const sortedSessions = Array.from(state.sessions.values()).sort(
    (a, b) => (b.lastActivity || 0) - (a.lastActivity || 0)
  );

  return {
    sessions: state.sessions,
    selectedSessionId: state.selectedSessionId,
    selectSession,
    handleMessage,
    sortedSessions,
  };
}
