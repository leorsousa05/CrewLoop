import { useCallback, useEffect, useState } from 'react';

export interface CommandPaletteState {
  open: boolean;
  query: string;
  selectedIndex: number;
}

export interface CommandPaletteActions {
  setOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
  setSelectedIndex: (index: number | ((prev: number) => number)) => void;
}

export function useCommandPalette(): CommandPaletteState & CommandPaletteActions {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndexState] = useState(0);

  const setSelectedIndex = useCallback(
    (index: number | ((prev: number) => number)) => {
      setSelectedIndexState((prev) => (typeof index === 'function' ? index(prev) : index));
    },
    []
  );

  useEffect(() => {
    setSelectedIndexState(0);
  }, [query]);

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  return { open, setOpen, query, setQuery, selectedIndex, setSelectedIndex };
}
