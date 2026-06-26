import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { PinnedSession } from '../lib/types';

interface PinnedSessionsContextValue {
  pins: PinnedSession[];
  addPin: (id: string) => void;
  removePin: (id: string) => void;
  togglePin: (id: string) => void;
  isPinned: (id: string) => boolean;
}

const STORAGE_KEY = 'crewloop-dashboard-pins';

const PinnedSessionsContext = createContext<PinnedSessionsContextValue | null>(null);

function loadPins(): PinnedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((p): p is PinnedSession => p && typeof p.id === 'string' && typeof p.pinnedAt === 'number');
  } catch {
    // ignore
  }
  return [];
}

function savePins(pins: PinnedSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
  } catch {
    // ignore
  }
}

export function PinnedSessionsProvider({ children }: { children: ReactNode }) {
  const [pins, setPins] = useState<PinnedSession[]>(() => loadPins());

  const addPin = useCallback((id: string) => {
    setPins((prev) => {
      if (prev.some((p) => p.id === id)) return prev;
      const next = [...prev, { id, pinnedAt: Date.now() }];
      savePins(next);
      return next;
    });
  }, []);

  const removePin = useCallback((id: string) => {
    setPins((prev) => {
      const next = prev.filter((p) => p.id !== id);
      savePins(next);
      return next;
    });
  }, []);

  const togglePin = useCallback(
    (id: string) => {
      if (pins.some((p) => p.id === id)) removePin(id);
      else addPin(id);
    },
    [pins, addPin, removePin]
  );

  const isPinned = useCallback(
    (id: string) => pins.some((p) => p.id === id),
    [pins]
  );

  return (
    <PinnedSessionsContext.Provider value={{ pins, addPin, removePin, togglePin, isPinned }}>
      {children}
    </PinnedSessionsContext.Provider>
  );
}

export function usePinnedSessions(): PinnedSessionsContextValue {
  const ctx = useContext(PinnedSessionsContext);
  if (!ctx) throw new Error('usePinnedSessions must be used within PinnedSessionsProvider');
  return ctx;
}
