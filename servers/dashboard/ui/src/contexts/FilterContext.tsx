import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { FilterState } from '../lib/types';
import { DEFAULT_FILTER_STATE } from '../lib/types';

interface FilterContextValue {
  filters: FilterState;
  setFilters: (updater: Partial<FilterState> | ((prev: FilterState) => FilterState)) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTER_STATE);

  const setFilters = useCallback(
    (updater: Partial<FilterState> | ((prev: FilterState) => FilterState)) => {
      setFiltersState((prev) => {
        if (typeof updater === 'function') {
          return (updater as (prev: FilterState) => FilterState)(prev);
        }
        return { ...prev, ...updater };
      });
    },
    []
  );

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTER_STATE), []);

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
