import { useEffect, useState } from 'react';

export function useNow(interval = 10_000): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [interval]);

  return now;
}
