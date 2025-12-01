/**
 * ProductService - Centralized data layer for product operations
 * Provides type-safe access to product and plant data
 */

import type { Product, Plant, SortOption, FilterState } from '../types';
import productsData from '../data/products.json';
import plantsData from '../data/plants.json';

// Type assertions for imported JSON data
const products = productsData.products as Product[];
const plants = plantsData as Plant[];

/**
 * Get all products
 */
export function getAllProducts(): Product[] {
  return products;
}

/**
 * Get a product by ID
 */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

/**
 * Get featured products
 */
export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

/**
 * Get products in stock
 */
export function getInStockProducts(): Product[] {
  return products.filter((p) => p.inStock);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  const categories = new Set(products.map((p) => p.category));
  return Array.from(categories);
}

/**
 * Get all plants
 */
export function getAllPlants(): Plant[] {
  return plants;
}

/**
 * Get a plant by ID
 */
export function getPlantById(id: string): Plant | undefined {
  return plants.find((p) => p.id === id);
}

/**
 * Filter and sort products based on filter state
 */
export function filterProducts(
  items: Product[],
  filters: Partial<FilterState>
): Product[] {
  let filtered = [...items];

  // Filter by categories
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter((p) => filters.categories!.includes(p.category));
  }

  // Filter by plants
  if (filters.plants && filters.plants.length > 0) {
    filtered = filtered.filter((p) =>
      p.plants?.some((plant) => filters.plants!.includes(plant))
    );
  }

  // Filter by price range
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filtered = filtered.filter((p) => p.price >= min && p.price <= max);
  }

  // Filter by stock
  if (filters.inStockOnly) {
    filtered = filtered.filter((p) => p.inStock);
  }

  // Filter by search query
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  // Sort products
  if (filters.sortBy) {
    filtered = sortProducts(filtered, filters.sortBy);
  }

  return filtered;
}

/**
 * Sort products by given option
 */
export function sortProducts(items: Product[], sortBy: SortOption): Product[] {
  const sorted = [...items];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'fr'));
    default:
      return sorted;
  }
}

/**
 * Get price range for products
 */
export function getPriceRange(items: Product[] = products): [number, number] {
  if (items.length === 0) return [0, 100];
  const prices = items.map((p) => p.price);
  return [Math.min(...prices), Math.max(...prices)];
}

/**
 * Get products containing a specific plant
 */
export function getProductsByPlant(plantId: string): Product[] {
  return products.filter((p) => p.plants?.includes(plantId));
}

/**
 * Search products by query
 */
export function searchProducts(query: string): Product[] {
  if (!query.trim()) return products;
  const normalizedQuery = query.toLowerCase().trim();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.description.toLowerCase().includes(normalizedQuery) ||
      p.category.toLowerCase().includes(normalizedQuery) ||
      p.ingredients.some((i) => i.toLowerCase().includes(normalizedQuery))
  );
}

// Default export for easier imports
export default {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  getInStockProducts,
  getCategories,
  getAllPlants,
  getPlantById,
  filterProducts,
  sortProducts,
  getPriceRange,
  getProductsByPlant,
  searchProducts,
};
