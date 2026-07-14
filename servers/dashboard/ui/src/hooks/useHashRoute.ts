import { useCallback, useEffect, useRef, useState } from 'react';
import type { RouteState } from '../lib/types';
import { parseRoute, serializeRoute, DEFAULT_ROUTE } from '../lib/route';

export interface HashRoute {
  route: RouteState;
  navigate(patch: Partial<RouteState>, mode?: 'push' | 'replace'): void;
}

export function useHashRoute(): HashRoute {
  const [route, setRoute] = useState<RouteState>(() =>
    typeof window === 'undefined' ? DEFAULT_ROUTE : parseRoute(window.location.hash)
  );
  const routeRef = useRef(route);
  routeRef.current = route;

  useEffect(() => {
    function onHashChange() {
      setRoute(parseRoute(window.location.hash));
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((patch: Partial<RouteState>, mode: 'push' | 'replace' = 'replace') => {
    const next: RouteState = { ...routeRef.current, ...patch };
    routeRef.current = next;
    const url = `${window.location.pathname}${window.location.search}${serializeRoute(next)}`;
    if (mode === 'push') {
      history.pushState(null, '', url);
    } else {
      history.replaceState(null, '', url);
    }
    setRoute(next);
  }, []);

  return { route, navigate };
}
