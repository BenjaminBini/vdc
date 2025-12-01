import { useState, useRef, useEffect, useCallback } from 'react';
import { useFilters, type SortOption } from '@stores/filterStore';
import { sanitizeSearchQuery, validatePriceRange } from '@utils/validation';
import type { Category } from '../types';

interface Plant {
  id: string;
  name: string;
}

interface StoreFiltersProps {
  categories: Category[];
  plants: Plant[];
  minPrice: number;
  maxPrice: number;
  compact?: boolean;
}

interface MultiSelectProps {
  options: { id: string; name: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  placeholder: string;
  compact?: boolean;
  colorClass?: string;
}

function MultiSelect({ options, selected, onToggle, placeholder, compact = false, colorClass = 'beaucharme-terracotta' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedNames = options
    .filter(opt => selected.includes(opt.id))
    .map(opt => opt.name);

  const accentColor = colorClass === 'beaucharme-terracotta' ? '#C4A484' : '#8B9D77';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border border-beaucharme-beige/60 rounded-lg bg-white text-left flex items-center justify-between transition-all duration-200 hover:border-beaucharme-earth/30 hover:shadow-sm ${
          compact ? 'px-3 py-2' : 'px-4 py-2.5'
        }`}
      >
        <span className={`${compact ? 'text-sm' : 'text-sm'} ${selected.length === 0 ? 'text-beaucharme-earth/50' : 'text-beaucharme-earth'}`}>
          {selected.length === 0
            ? placeholder
            : selectedNames.join(', ')
          }
        </span>
        <svg
          className={`w-3.5 h-3.5 text-beaucharme-earth/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1.5 w-full bg-white border border-beaucharme-beige/40 rounded-lg shadow-md overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <label
                  key={option.id}
                  className={`flex items-center gap-2.5 cursor-pointer transition-colors ${
                    compact ? 'px-3 py-2' : 'px-4 py-2.5'
                  } ${isSelected ? 'bg-beaucharme-cream/30' : 'hover:bg-beaucharme-cream/20'}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(option.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center transition-all duration-200 ${
                      isSelected ? '' : 'border border-beaucharme-earth/20'
                    }`}
                    style={isSelected ? { backgroundColor: accentColor } : {}}
                  >
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-beaucharme-dark font-medium' : 'text-beaucharme-earth'}`}>
                    {option.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoreFilters({ categories, plants, minPrice, maxPrice, compact = false }: StoreFiltersProps) {
  const {
    categories: selectedCategories,
    plants: selectedPlants,
    priceRange,
    inStockOnly,
    sortBy,
    searchQuery,
    toggleCategory,
    togglePlant,
    setPriceRange,
    setInStockOnly,
    setSortBy,
    setSearchQuery,
    resetFilters,
    hasActiveFilters,
  } = useFilters();

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'default', label: 'Par defaut' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix decroissant' },
    { value: 'name-asc', label: 'Nom A-Z' },
    { value: 'name-desc', label: 'Nom Z-A' },
  ];

  // Sanitized search handler - prevents XSS
  const handleSearchChange = useCallback((value: string) => {
    const sanitized = sanitizeSearchQuery(value);
    setSearchQuery(sanitized);
  }, [setSearchQuery]);

  // Validated price range handlers - ensures valid bounds
  const handleMinPriceChange = useCallback((value: string) => {
    const numValue = Number(value);
    const [safeMin, safeMax] = validatePriceRange(numValue, priceRange[1], minPrice, maxPrice);
    setPriceRange([safeMin, safeMax]);
  }, [priceRange, minPrice, maxPrice, setPriceRange]);

  const handleMaxPriceChange = useCallback((value: string) => {
    const numValue = Number(value);
    const [safeMin, safeMax] = validatePriceRange(priceRange[0], numValue, minPrice, maxPrice);
    setPriceRange([safeMin, safeMax]);
  }, [priceRange, minPrice, maxPrice, setPriceRange]);

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {/* Search */}
      <div>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher..."
            maxLength={100}
            className={`w-full pl-9 border border-beaucharme-beige/60 rounded-lg bg-white focus:outline-none focus:border-beaucharme-earth/30 focus:shadow-sm transition-all duration-200 text-sm text-beaucharme-earth placeholder:text-beaucharme-earth/50 ${compact ? 'px-3 py-2' : 'px-4 py-2.5'}`}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beaucharme-earth/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Category Filters */}
      <div>
        <h3 className={`font-medium text-beaucharme-dark ${compact ? 'text-sm mb-2' : 'text-sm mb-2.5'}`}>Catégories</h3>
        <MultiSelect
          options={categories}
          selected={selectedCategories}
          onToggle={toggleCategory}
          placeholder="Toutes les catégories"
          compact={compact}
          colorClass="beaucharme-terracotta"
        />
      </div>

      {/* Plants Filters */}
      <div>
        <h3 className={`font-medium text-beaucharme-dark ${compact ? 'text-sm mb-2' : 'text-sm mb-2.5'}`}>Fleurs</h3>
        <MultiSelect
          options={plants}
          selected={selectedPlants}
          onToggle={togglePlant}
          placeholder="Toutes les fleurs"
          compact={compact}
          colorClass="beaucharme-sage"
        />
      </div>

      {/* Price Range & Stock - Side by side in compact mode */}
      <div className={compact ? 'flex gap-4' : 'space-y-6'}>
        {/* Price Range */}
        <div className={compact ? 'flex-1' : ''}>
          <h3 className={`font-medium text-beaucharme-dark ${compact ? 'text-sm mb-2' : 'text-sm mb-2.5'}`}>Prix</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={minPrice}
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className={`w-full border border-beaucharme-beige/60 rounded-lg bg-white focus:outline-none focus:border-beaucharme-earth/30 focus:shadow-sm transition-all duration-200 text-center text-sm text-beaucharme-earth ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}`}
            />
            <span className="text-beaucharme-earth/40 text-sm">–</span>
            <input
              type="number"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className={`w-full border border-beaucharme-beige/60 rounded-lg bg-white focus:outline-none focus:border-beaucharme-earth/30 focus:shadow-sm transition-all duration-200 text-center text-sm text-beaucharme-earth ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}`}
            />
          </div>
        </div>

        {/* In Stock Toggle */}
        <div className={compact ? 'flex items-end' : ''}>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`bg-beaucharme-beige/50 rounded-full peer-checked:bg-beaucharme-sage/80 transition-colors duration-200 ${compact ? 'w-8 h-5' : 'w-9 h-5'}`}></div>
              <div className={`absolute top-0.5 bg-white rounded-full shadow-sm transition-transform duration-200 ${compact ? 'left-0.5 w-4 h-4 peer-checked:translate-x-3' : 'left-0.5 w-4 h-4 peer-checked:translate-x-4'}`}></div>
            </div>
            <span className={`text-beaucharme-earth group-hover:text-beaucharme-dark transition-colors text-sm`}>
              {compact ? 'En stock' : 'En stock uniquement'}
            </span>
          </label>
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className={`font-medium text-beaucharme-dark ${compact ? 'text-sm mb-2' : 'text-sm mb-2.5'}`}>Trier par</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className={`w-full border border-beaucharme-beige/60 rounded-lg bg-white focus:outline-none focus:border-beaucharme-earth/30 focus:shadow-sm transition-all duration-200 text-sm text-beaucharme-earth cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2212%22%20height%3d%2212%22%20viewBox%3d%220%200%2012%2012%22%3e%3cpath%20fill%3d%22%239B8B7A%22%20d%3d%22M2%204l4%204%204-4%22%2f%3e%3c%2fsvg%3e')] bg-no-repeat bg-[right_12px_center] ${compact ? 'px-3 py-2 pr-8' : 'px-4 py-2.5 pr-10'}`}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Filters */}
      {hasActiveFilters() && (
        <button
          onClick={resetFilters}
          className={`w-full text-beaucharme-terracotta text-sm font-medium hover:text-beaucharme-terracotta/70 transition-colors duration-200 underline underline-offset-2 ${compact ? 'py-1' : 'py-2'}`}
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}
