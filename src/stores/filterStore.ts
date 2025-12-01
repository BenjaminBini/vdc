import { useSyncExternalStore, useState, useEffect } from 'react';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export interface FilterState {
  categories: string[];
  plants: string[];
  priceRange: [number, number];
  inStockOnly: boolean;
  sortBy: SortOption;
  searchQuery: string;
}

const DEFAULT_PRICE_MIN = 0;
const DEFAULT_PRICE_MAX = 100;

// Cached empty state for SSR - must be same reference
const emptyState: FilterState = {
  categories: [],
  plants: [],
  priceRange: [DEFAULT_PRICE_MIN, DEFAULT_PRICE_MAX],
  inStockOnly: false,
  sortBy: 'default',
  searchQuery: '',
};

let state: FilterState = { ...emptyState };

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const filterStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): FilterState {
    return state;
  },

  getServerSnapshot(): FilterState {
    return emptyState;
  },

  setCategories(categories: string[]) {
    state = { ...state, categories };
    emitChange();
  },

  toggleCategory(categoryId: string) {
    const newCategories = state.categories.includes(categoryId)
      ? state.categories.filter((c) => c !== categoryId)
      : [...state.categories, categoryId];
    state = { ...state, categories: newCategories };
    emitChange();
  },

  setPlants(plants: string[]) {
    state = { ...state, plants };
    emitChange();
  },

  togglePlant(plantId: string) {
    const newPlants = state.plants.includes(plantId)
      ? state.plants.filter((p) => p !== plantId)
      : [...state.plants, plantId];
    state = { ...state, plants: newPlants };
    emitChange();
  },

  setPriceRange(range: [number, number]) {
    state = { ...state, priceRange: range };
    emitChange();
  },

  setInStockOnly(inStockOnly: boolean) {
    state = { ...state, inStockOnly };
    emitChange();
  },

  setSortBy(sortBy: SortOption) {
    state = { ...state, sortBy };
    emitChange();
  },

  setSearchQuery(searchQuery: string) {
    state = { ...state, searchQuery };
    emitChange();
  },

  resetFilters() {
    state = {
      categories: [],
      plants: [],
      priceRange: [DEFAULT_PRICE_MIN, DEFAULT_PRICE_MAX],
      inStockOnly: false,
      sortBy: 'default',
      searchQuery: '',
    };
    emitChange();
  },

  hasActiveFilters(): boolean {
    return (
      state.categories.length > 0 ||
      state.plants.length > 0 ||
      state.priceRange[0] > DEFAULT_PRICE_MIN ||
      state.priceRange[1] < DEFAULT_PRICE_MAX ||
      state.inStockOnly ||
      state.searchQuery.length > 0
    );
  },
};

export function useFilters() {
  const [isMounted, setIsMounted] = useState(false);

  const filterState = useSyncExternalStore(
    filterStore.subscribe,
    filterStore.getSnapshot,
    filterStore.getServerSnapshot
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return empty state during SSR/hydration to match server
  const safeState = isMounted ? filterState : emptyState;

  return {
    ...safeState,
    setCategories: filterStore.setCategories,
    toggleCategory: filterStore.toggleCategory,
    setPlants: filterStore.setPlants,
    togglePlant: filterStore.togglePlant,
    setPriceRange: filterStore.setPriceRange,
    setInStockOnly: filterStore.setInStockOnly,
    setSortBy: filterStore.setSortBy,
    setSearchQuery: filterStore.setSearchQuery,
    resetFilters: filterStore.resetFilters,
    hasActiveFilters: isMounted ? filterStore.hasActiveFilters : () => false,
  };
}

// NOTE: Global window exposure removed for security
// Use the useFilters() hook to access filter state in components
