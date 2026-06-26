import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useViewport(): { width: number; breakpoint: Breakpoint } {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  let breakpoint: Breakpoint = 'desktop';
  if (width < 768) breakpoint = 'mobile';
  else if (width < 1024) breakpoint = 'tablet';

  return { width, breakpoint };
}
