import { useCallback, useEffect, useRef, type RefObject } from 'react';

export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isHiddenFromFocus(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;
  while (current) {
    if (
      current.hasAttribute('hidden') ||
      current.hasAttribute('inert') ||
      current.getAttribute('aria-hidden')?.toLowerCase() === 'true'
    ) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !isHiddenFromFocus(element)
  );
}

export function nextFocusableIndex(currentIndex: number, length: number, backwards: boolean): number {
  if (length === 0) return -1;
  if (backwards) return currentIndex <= 0 ? length - 1 : currentIndex - 1;
  return currentIndex === -1 || currentIndex >= length - 1 ? 0 : currentIndex + 1;
}

export function hasOpenOverlay(): boolean {
  return typeof document !== 'undefined' && document.querySelector('[role="dialog"]') !== null;
}

interface Options {
  open: boolean;
  containerRef: RefObject<HTMLElement>;
  initialFocusRef?: RefObject<HTMLElement>;
  restoreFocusRef?: RefObject<HTMLElement>;
}

interface FocusTrapHandlers {
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
}

export function useFocusTrap({
  open,
  containerRef,
  initialFocusRef,
  restoreFocusRef,
}: Options): FocusTrapHandlers {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = restoreFocusRef?.current ?? (document.activeElement as HTMLElement | null);
    const initialFocus = initialFocusRef?.current;
    const focusable = getFocusableElements(containerRef.current);
    (initialFocus || focusable[0] || containerRef.current)?.focus();

    return () => {
      const restoreTarget = restoreFocusRef?.current ?? previousFocusRef.current;
      if (restoreTarget && document.contains(restoreTarget)) restoreTarget.focus();
      previousFocusRef.current = null;
    };
  }, [containerRef, initialFocusRef, open, restoreFocusRef]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (!open || event.key !== 'Tab') return;

      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        containerRef.current?.focus();
        return;
      }

      const current = document.activeElement as HTMLElement | null;
      const currentIndex = focusable.indexOf(current as HTMLElement);
      const nextIndex = nextFocusableIndex(currentIndex, focusable.length, event.shiftKey);

      event.preventDefault();
      event.stopPropagation();
      focusable[nextIndex].focus();
    },
    [containerRef, open]
  );

  return { onKeyDown };
}
