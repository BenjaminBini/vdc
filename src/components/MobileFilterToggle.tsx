import { useState } from 'react';
import StoreFilters from './StoreFilters';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Plant {
  id: string;
  name: string;
}

interface MobileFilterToggleProps {
  categories: Category[];
  plants: Plant[];
  minPrice: number;
  maxPrice: number;
}

export default function MobileFilterToggle({ categories, plants, minPrice, maxPrice }: MobileFilterToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Toggle Button */}
      <div className="sticky top-2 z-40 mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white shadow-md rounded-2xl px-6 py-4 flex items-center justify-between text-beaucharme-dark font-medium"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            Filtres
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <StoreFilters
            categories={categories}
            plants={plants}
            minPrice={minPrice}
            maxPrice={maxPrice}
            compact={true}
          />
        </div>
      )}
    </div>
  );
}
