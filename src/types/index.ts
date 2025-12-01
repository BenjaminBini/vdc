/**
 * Centralized type definitions for Beaucharme e-commerce
 * Single source of truth for all shared types
 */

/**
 * Product - Core product type used across the application
 */
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  ingredients: string[];
  plants?: string[];
  image: string;
  inStock: boolean;
  featured?: boolean;
  badge?: string;
}

/**
 * CartItem - Product in the shopping cart with quantity
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

/**
 * CartState - Complete cart state
 */
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * CartTotals - Calculated cart values
 */
export interface CartTotals {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

/**
 * Category - Product category
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

/**
 * PlantBenefit - A benefit provided by a plant
 */
export interface PlantBenefit {
  title: string;
  description: string;
}

/**
 * Plant - Plant used in products
 */
export interface Plant {
  id: string;
  name: string;
  latinName?: string;
  family?: string;
  image?: string;
  color?: string;
  shortDescription?: string;
  description?: string;
  history?: string;
  composition?: string[];
  benefits?: PlantBenefit[];
  idealFor?: string[];
}

/**
 * SortOption - Available sort options for product listing
 */
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

/**
 * FilterState - Current filter settings
 */
export interface FilterState {
  categories: string[];
  plants: string[];
  priceRange: [number, number];
  inStockOnly: boolean;
  sortBy: SortOption;
  searchQuery: string;
}

/**
 * ActionResult - Generic result wrapper for async operations
 */
export interface ActionResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * AddToCartProduct - Minimal product data needed to add to cart
 */
export interface AddToCartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

/**
 * CartContextValue - Cart context with state and actions
 */
export interface CartContextValue extends Omit<CartState, 'error'> {
  error: string | null;
  addItem: (product: AddToCartProduct) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getTotals: () => CartTotals;
}
