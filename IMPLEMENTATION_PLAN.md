# Implementation Plan - Beaucharme E-Commerce Remediation

Based on the comprehensive code review completed on December 1, 2025.

**Total Estimated Effort:** 95-130 hours
**Recommended Timeline:** 6-8 weeks
**Priority Order:** Security > Architecture > Testing > Performance > Documentation

---

## Phase 1: Critical Security Fixes

**Timeline:** Week 1
**Effort:** 15-20 hours
**Priority:** CRITICAL - Must complete before any public deployment

### 1.1 Add Content Security Policy (2-3 hours)

**File:** `src/layouts/Layout.astro`

**Task:** Add CSP meta tag to prevent XSS attacks.

```astro
<!-- Add to <head> section -->
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self';">
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

**Verification:**
- [ ] CSP header present in browser DevTools
- [ ] No CSP violations in console
- [ ] Site still functions correctly

---

### 1.2 Input Validation for Search & Filters (4-5 hours)

**Files to modify:**
- `src/components/StoreFilters.tsx`
- `src/stores/filterStore.ts`

**Task 1:** Create validation utility

**New file:** `src/utils/validation.ts`

```typescript
/**
 * Sanitize search query to prevent XSS
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return '';
  // Remove HTML tags and limit length
  return query
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`]/g, '')
    .trim()
    .slice(0, 100);
}

/**
 * Validate price range values
 */
export function validatePriceRange(
  min: number,
  max: number,
  absoluteMin: number,
  absoluteMax: number
): [number, number] {
  const safeMin = Math.max(absoluteMin, Math.min(min, absoluteMax));
  const safeMax = Math.min(absoluteMax, Math.max(max, absoluteMin));
  return safeMin <= safeMax ? [safeMin, safeMax] : [safeMin, safeMin];
}

/**
 * Validate product ID format
 */
export function isValidProductId(id: string): boolean {
  return typeof id === 'string' && /^[a-z0-9-]+$/.test(id);
}
```

**Task 2:** Update StoreFilters.tsx

```typescript
// In handleSearch function
const handleSearchChange = (value: string) => {
  const sanitized = sanitizeSearchQuery(value);
  setSearchQuery(sanitized);
};

// In price range handlers
const handleMinPriceChange = (value: number) => {
  const [safeMin, safeMax] = validatePriceRange(value, priceRange[1], minPrice, maxPrice);
  setPriceRange([safeMin, safeMax]);
};
```

**Verification:**
- [ ] Search with `<script>alert('XSS')</script>` is sanitized
- [ ] Price range cannot be set to negative values
- [ ] Long search queries are truncated

---

### 1.3 Validate localStorage Cart Data (3-4 hours)

**File:** `src/stores/cartStore.ts`

**Task:** Replace unsafe JSON.parse with validated parsing

```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    /^[a-z0-9-]+$/.test(obj.id) &&
    typeof obj.name === 'string' &&
    obj.name.length > 0 &&
    obj.name.length < 200 &&
    typeof obj.price === 'number' &&
    Number.isFinite(obj.price) &&
    obj.price >= 0 &&
    typeof obj.image === 'string' &&
    typeof obj.quantity === 'number' &&
    Number.isInteger(obj.quantity) &&
    obj.quantity > 0 &&
    obj.quantity <= 99
  );
}

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid cart data format, resetting cart');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Filter out invalid items
    const validItems = parsed.filter(isValidCartItem);
    if (validItems.length !== parsed.length) {
      console.warn(`Removed ${parsed.length - validItems.length} invalid cart items`);
      saveToStorage(validItems);
    }

    return validItems;
  } catch (error) {
    console.error('Failed to parse cart data:', error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}
```

**Verification:**
- [ ] Corrupted localStorage data is handled gracefully
- [ ] Invalid cart items are removed
- [ ] XSS in cart item names is prevented

---

### 1.4 Remove Window Global Exposure (2-3 hours)

**Files:**
- `src/stores/filterStore.ts` - Remove line 151-153
- `src/stores/cartStore.ts` - Replace window globals (Phase 2 full fix)

**Quick fix for filterStore.ts:**

```typescript
// DELETE these lines (151-153):
// if (typeof window !== 'undefined') {
//   (window as any).beaucharmeFilters = filterStore;
// }
```

**Verification:**
- [ ] `window.beaucharmeFilters` is undefined in console
- [ ] Filters still work correctly

---

### 1.5 Replace set:html with Safe Rendering (2-3 hours)

**File:** `src/pages/nos-produits/[category].astro`

**Current (unsafe):**
```astro
<div set:html={categoryInfo.story} />
```

**Safe alternative - Convert HTML strings to Astro components:**

```astro
---
// Define story content as structured data instead of HTML strings
const categoryStories = {
  'huiles-vegetales': [
    'Tout commence par la graine. Nos huiles vegetales sont obtenues par premiere pression a froid...',
    'Chaque huile conserve ainsi toute la richesse de la plante...'
  ],
  // ... other categories
};

const storyParagraphs = categoryStories[categoryId] || [];
---

<div class="prose prose-lg text-beaucharme-earth space-y-4">
  {storyParagraphs.map(paragraph => (
    <p>{paragraph}</p>
  ))}
</div>
```

**If HTML is required, use DOMPurify:**

```typescript
// Install: npm install dompurify @types/dompurify
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(categoryInfo.story, {
  ALLOWED_TAGS: ['p', 'strong', 'em', 'br'],
  ALLOWED_ATTR: []
});
```

---

## Phase 2: Architecture Refactoring

**Timeline:** Weeks 2-3
**Effort:** 30-40 hours
**Priority:** HIGH

### 2.1 Create Centralized Types (4-5 hours)

**New file:** `src/types/index.ts`

```typescript
/**
 * Core product type - single source of truth
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
 * Cart item extends product with quantity
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

/**
 * Cart state
 */
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Filter state
 */
export interface FilterState {
  categories: string[];
  plants: string[];
  priceRange: [number, number];
  inStockOnly: boolean;
  sortBy: SortOption;
  searchQuery: string;
}

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc';

/**
 * Category definition
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

/**
 * Plant definition
 */
export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  description?: string;
  image?: string;
}

/**
 * Cart totals
 */
export interface CartTotals {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

/**
 * Action result wrapper
 */
export interface ActionResult<T> {
  data: T | null;
  error: Error | null;
}
```

**Files to update:**
- [ ] `src/stores/cartStore.ts` - Import from types
- [ ] `src/stores/filterStore.ts` - Import from types
- [ ] `src/actions/cart.ts` - Import from types
- [ ] `src/components/ProductCardReact.tsx` - Remove local Product interface
- [ ] `src/components/FilteredProductGrid.tsx` - Remove local Product interface
- [ ] `src/env.d.ts` - Remove duplicate interfaces

---

### 2.2 Replace Window Globals with React Context (10-12 hours)

**New file:** `src/contexts/CartContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, CartState, CartTotals, Product } from '../types';

const STORAGE_KEY = 'beaucharme-cart';

interface CartContextValue extends CartState {
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getTotals: () => CartTotals;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(isValidCartItem));
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Body overflow for sidebar
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const addItem = useCallback(async (product: Product) => {
    setIsLoading(true);
    setError(null);
    try {
      setItems(current => {
        const existing = current.find(item => item.id === product.id);
        if (existing) {
          return current.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...current, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        }];
      });
    } catch (err) {
      setError('Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      setItems(current => current.filter(item => item.id !== productId));
    } catch (err) {
      setError('Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    setIsLoading(true);
    setError(null);
    try {
      if (quantity <= 0) {
        setItems(current => current.filter(item => item.id !== productId));
      } else {
        setItems(current =>
          current.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (err) {
      setError('Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setItems([]);
    setError(null);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const getTotal = useCallback(() =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  [items]);

  const getItemCount = useCallback(() =>
    items.reduce((sum, item) => sum + item.quantity, 0),
  [items]);

  const getTotals = useCallback((): CartTotals => {
    const subtotal = getTotal();
    const shipping = subtotal >= 50 ? 0 : 5.9;
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      itemCount: getItemCount()
    };
  }, [getTotal, getItemCount]);

  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      isLoading,
      error,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      getTotal,
      getItemCount,
      getTotals
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    typeof obj.image === 'string' &&
    typeof obj.quantity === 'number'
  );
}
```

**Update Layout.astro:**

```astro
---
import { CartProvider } from '../contexts/CartContext';
---
<html>
  <body>
    <CartProvider client:load>
      <slot />
    </CartProvider>
  </body>
</html>
```

---

### 2.3 Create ProductService Data Layer (6-8 hours)

**New file:** `src/services/ProductService.ts`

```typescript
import productsData from '../data/products.json';
import plantsData from '../data/plants.json';
import type { Product, Category, Plant } from '../types';

class ProductServiceClass {
  private baseUrl: string = '';

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  private resolveImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/') && !path.startsWith('//')) {
      return `${this.baseUrl}${path}`;
    }
    return path;
  }

  getAll(): Product[] {
    return productsData.products.map(p => ({
      ...p,
      image: this.resolveImageUrl(p.image)
    }));
  }

  getById(id: string): Product | null {
    const product = productsData.products.find(p => p.id === id);
    if (!product) return null;
    return {
      ...product,
      image: this.resolveImageUrl(product.image)
    };
  }

  getByCategory(categoryId: string): Product[] {
    return this.getAll().filter(p => p.category === categoryId);
  }

  getFeatured(): Product[] {
    return this.getAll().filter(p => p.featured);
  }

  getRelatedProducts(productId: string, limit = 3): Product[] {
    const product = this.getById(productId);
    if (!product) return [];
    return this.getByCategory(product.category)
      .filter(p => p.id !== productId)
      .slice(0, limit);
  }

  getCategories(): Category[] {
    return productsData.categories;
  }

  getCategoryById(id: string): Category | null {
    return productsData.categories.find(c => c.id === id) || null;
  }

  getPlants(): Plant[] {
    return plantsData.map(p => ({
      id: p.id,
      name: p.name,
      scientificName: p.scientificName,
      description: p.description,
      image: this.resolveImageUrl(p.image)
    }));
  }

  getPlantById(id: string): Plant | null {
    const plant = plantsData.find(p => p.id === id);
    if (!plant) return null;
    return {
      ...plant,
      image: this.resolveImageUrl(plant.image)
    };
  }
}

export const ProductService = new ProductServiceClass();
```

**Usage in pages:**

```astro
---
import { ProductService } from '../services/ProductService';

ProductService.setBaseUrl(import.meta.env.BASE_URL);
const products = ProductService.getAll();
const categories = ProductService.getCategories();
---
```

---

### 2.4 Consolidate Cart Button Components (4-5 hours)

**New file:** `src/components/CartControls.tsx`

```typescript
import { useState, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../types';

interface CartControlsProps {
  product: Product;
  variant?: 'simple' | 'full' | 'compact';
  className?: string;
}

export default function CartControls({
  product,
  variant = 'simple',
  className = ''
}: CartControlsProps) {
  const { items, addItem, updateQuantity, removeItem, isLoading } = useCart();
  const [showFeedback, setShowFeedback] = useState(false);

  const cartItem = items.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = useCallback(async () => {
    await addItem(product);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  }, [addItem, product]);

  const handleIncrement = useCallback(() => {
    updateQuantity(product.id, quantity + 1);
  }, [updateQuantity, product.id, quantity]);

  const handleDecrement = useCallback(() => {
    if (quantity <= 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  }, [updateQuantity, removeItem, product.id, quantity]);

  if (!product.inStock) {
    return (
      <button
        disabled
        className={`bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed ${className}`}
      >
        Indisponible
      </button>
    );
  }

  // Simple variant - just add button
  if (variant === 'simple' || quantity === 0) {
    return (
      <button
        onClick={handleAdd}
        disabled={isLoading}
        className={`btn-primary ${className}`}
      >
        {showFeedback ? 'Ajouté !' : 'Ajouter au panier'}
      </button>
    );
  }

  // Full variant - quantity controls
  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleDecrement}
          className="w-10 h-10 rounded-full border border-beaucharme-sage text-beaucharme-sage hover:bg-beaucharme-sage hover:text-white transition-colors"
        >
          {quantity === 1 ? '×' : '−'}
        </button>
        <span className="w-8 text-center font-medium">{quantity}</span>
        <button
          onClick={handleIncrement}
          className="w-10 h-10 rounded-full border border-beaucharme-sage text-beaucharme-sage hover:bg-beaucharme-sage hover:text-white transition-colors"
        >
          +
        </button>
      </div>
    );
  }

  // Compact variant
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button onClick={handleDecrement} className="px-2 py-1 text-sm">−</button>
      <span className="px-2">{quantity}</span>
      <button onClick={handleIncrement} className="px-2 py-1 text-sm">+</button>
    </div>
  );
}
```

**Files to delete after migration:**
- [ ] `src/components/AddToCartButton.tsx`
- [ ] `src/components/ProductAddToCart.tsx`
- [ ] `src/components/ProductAddToCartCompact.tsx`

---

### 2.5 Add Error Boundary (2-3 hours)

**New file:** `src/components/ErrorBoundary.tsx`

```typescript
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-medium">Une erreur est survenue</h2>
          <p className="text-red-600 text-sm mt-1">
            Veuillez rafraichir la page ou reessayer plus tard.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm text-red-700 underline"
          >
            Reessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Phase 3: Testing Setup

**Timeline:** Week 4
**Effort:** 20-30 hours
**Priority:** HIGH

### 3.1 Install Testing Framework (1-2 hours)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**New file:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@stores': '/src/stores',
      '@utils': '/src/utils',
      '@types': '/src/types'
    }
  }
});
```

**New file:** `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

**Update package.json:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

### 3.2 Cart Actions Tests (6-8 hours)

**New file:** `src/actions/cart.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as cartActions from './cart';

describe('Cart Actions', () => {
  const mockProduct = {
    id: 'test-product',
    name: 'Test Product',
    price: 19.99,
    image: '/images/test.jpg',
    category: 'test',
    description: 'Test description',
    ingredients: [],
    inStock: true
  };

  describe('addToCart', () => {
    it('should add a new product to empty cart', async () => {
      const result = await cartActions.addToCart([], mockProduct);
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].quantity).toBe(1);
    });

    it('should increment quantity for existing product', async () => {
      const existingCart = [{ ...mockProduct, quantity: 1 }];
      const result = await cartActions.addToCart(existingCart, mockProduct);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].quantity).toBe(2);
    });

    it('should reject invalid product', async () => {
      const result = await cartActions.addToCart([], {} as any);
      expect(result.error).not.toBeNull();
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity correctly', async () => {
      const cart = [{ ...mockProduct, quantity: 1 }];
      const result = await cartActions.updateQuantity(cart, mockProduct.id, 5);
      expect(result.data?.[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', async () => {
      const cart = [{ ...mockProduct, quantity: 1 }];
      const result = await cartActions.updateQuantity(cart, mockProduct.id, 0);
      expect(result.data).toHaveLength(0);
    });

    it('should reject negative quantity', async () => {
      const cart = [{ ...mockProduct, quantity: 1 }];
      const result = await cartActions.updateQuantity(cart, mockProduct.id, -1);
      expect(result.error).not.toBeNull();
    });
  });

  describe('getCartTotals', () => {
    it('should calculate correct totals', () => {
      const cart = [
        { ...mockProduct, price: 20, quantity: 2 },
        { ...mockProduct, id: 'p2', price: 15, quantity: 1 }
      ];
      const totals = cartActions.getCartTotals(cart);
      expect(totals.subtotal).toBe(55);
      expect(totals.shipping).toBe(0); // Free shipping over 50
      expect(totals.total).toBe(55);
      expect(totals.itemCount).toBe(3);
    });

    it('should add shipping under 50 euros', () => {
      const cart = [{ ...mockProduct, price: 20, quantity: 1 }];
      const totals = cartActions.getCartTotals(cart);
      expect(totals.shipping).toBe(5.9);
      expect(totals.total).toBe(25.9);
    });
  });
});
```

---

### 3.3 Validation Utils Tests (3-4 hours)

**New file:** `src/utils/validation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeSearchQuery, validatePriceRange, isValidProductId } from './validation';

describe('sanitizeSearchQuery', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeSearchQuery('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
  });

  it('should remove dangerous characters', () => {
    expect(sanitizeSearchQuery('test<>"\'')).toBe('test');
  });

  it('should truncate long strings', () => {
    const longString = 'a'.repeat(150);
    expect(sanitizeSearchQuery(longString)).toHaveLength(100);
  });

  it('should handle non-string input', () => {
    expect(sanitizeSearchQuery(null as any)).toBe('');
    expect(sanitizeSearchQuery(undefined as any)).toBe('');
    expect(sanitizeSearchQuery(123 as any)).toBe('');
  });
});

describe('validatePriceRange', () => {
  it('should return valid range unchanged', () => {
    expect(validatePriceRange(10, 50, 0, 100)).toEqual([10, 50]);
  });

  it('should clamp min to absolute minimum', () => {
    expect(validatePriceRange(-5, 50, 0, 100)).toEqual([0, 50]);
  });

  it('should clamp max to absolute maximum', () => {
    expect(validatePriceRange(10, 150, 0, 100)).toEqual([10, 100]);
  });

  it('should handle inverted range', () => {
    const result = validatePriceRange(50, 10, 0, 100);
    expect(result[0]).toBeLessThanOrEqual(result[1]);
  });
});

describe('isValidProductId', () => {
  it('should accept valid IDs', () => {
    expect(isValidProductId('huile-lavande')).toBe(true);
    expect(isValidProductId('product-123')).toBe(true);
  });

  it('should reject invalid IDs', () => {
    expect(isValidProductId('')).toBe(false);
    expect(isValidProductId('Product Name')).toBe(false);
    expect(isValidProductId('../etc/passwd')).toBe(false);
  });
});
```

---

### 3.4 Filter Store Tests (4-5 hours)

**New file:** `src/stores/filterStore.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { filterStore } from './filterStore';

describe('filterStore', () => {
  beforeEach(() => {
    filterStore.resetFilters();
  });

  describe('category management', () => {
    it('should add category when toggled', () => {
      filterStore.toggleCategory('huiles');
      expect(filterStore.getSnapshot().categories).toContain('huiles');
    });

    it('should remove category when toggled twice', () => {
      filterStore.toggleCategory('huiles');
      filterStore.toggleCategory('huiles');
      expect(filterStore.getSnapshot().categories).not.toContain('huiles');
    });
  });

  describe('price range', () => {
    it('should update price range', () => {
      filterStore.setPriceRange([10, 50]);
      expect(filterStore.getSnapshot().priceRange).toEqual([10, 50]);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false with default state', () => {
      expect(filterStore.hasActiveFilters()).toBe(false);
    });

    it('should return true with active category', () => {
      filterStore.toggleCategory('huiles');
      expect(filterStore.hasActiveFilters()).toBe(true);
    });

    it('should return true with search query', () => {
      filterStore.setSearchQuery('lavande');
      expect(filterStore.hasActiveFilters()).toBe(true);
    });
  });

  describe('resetFilters', () => {
    it('should clear all filters', () => {
      filterStore.toggleCategory('huiles');
      filterStore.setSearchQuery('test');
      filterStore.resetFilters();

      const state = filterStore.getSnapshot();
      expect(state.categories).toHaveLength(0);
      expect(state.searchQuery).toBe('');
    });
  });
});
```

---

## Phase 4: Performance Optimization

**Timeline:** Weeks 5-6
**Effort:** 20-25 hours
**Priority:** MEDIUM

### 4.1 Add Search Debouncing (2-3 hours)

**New file:** `src/hooks/useDebounce.ts`

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**Update StoreFilters.tsx:**

```typescript
import { useDebounce } from '../hooks/useDebounce';

// In component:
const [localSearch, setLocalSearch] = useState(searchQuery);
const debouncedSearch = useDebounce(localSearch, 300);

useEffect(() => {
  setSearchQuery(debouncedSearch);
}, [debouncedSearch, setSearchQuery]);

// In JSX:
<input
  value={localSearch}
  onChange={(e) => setLocalSearch(e.target.value)}
/>
```

---

### 4.2 Add React.memo to ProductCard (2-3 hours)

**Update ProductCardReact.tsx:**

```typescript
import { memo } from 'react';

function ProductCardReact({ product, baseUrl }: ProductCardReactProps) {
  // ... component code
}

export default memo(ProductCardReact, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.inStock === nextProps.product.inStock &&
    prevProps.baseUrl === nextProps.baseUrl
  );
});
```

---

### 4.3 Optimize Hydration Directives (2-3 hours)

**Update boutique.astro:**

```astro
<!-- Before -->
<MobileFilterToggle client:load />
<StoreFilters client:load />
<FilteredProductGrid client:load />

<!-- After -->
<MobileFilterToggle client:visible />
<StoreFilters client:idle />
<FilteredProductGrid client:load />
```

**Update Header.astro:**

```astro
<!-- Before -->
<CartButton client:load />
<MobileMenu client:load />

<!-- After -->
<CartButton client:idle />
<MobileMenu client:visible />
```

---

### 4.4 Memoize Cart Lookups (2-3 hours)

**Update FilteredProductGrid.tsx or CartContext:**

```typescript
// Create a Map for O(1) cart lookups
const cartItemMap = useMemo(() => {
  const map = new Map<string, number>();
  items.forEach(item => map.set(item.id, item.quantity));
  return map;
}, [items]);

// Usage in ProductCard
const quantity = cartItemMap.get(product.id) || 0;
```

---

### 4.5 Add Responsive Images (6-8 hours)

**New file:** `src/components/OptimizedImage.astro`

```astro
---
import { Image } from 'astro:assets';

interface Props {
  src: string | ImageMetadata;
  alt: string;
  widths?: number[];
  sizes?: string;
  class?: string;
}

const {
  src,
  alt,
  widths = [300, 600, 900],
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  class: className
} = Astro.props;
---

{typeof src === 'string' ? (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    class={className}
  />
) : (
  <Image
    src={src}
    alt={alt}
    widths={widths}
    sizes={sizes}
    format="webp"
    loading="lazy"
    class={className}
  />
)}
```

---

## Phase 5: Documentation

**Timeline:** Ongoing
**Effort:** 10-15 hours
**Priority:** MEDIUM

### 5.1 Update README.md

Add sections:
- Architecture overview
- State management explanation
- Testing instructions
- Deployment guide
- Environment variables
- Contributing guidelines

### 5.2 Add JSDoc to Components

```typescript
/**
 * ProductCardReact - Displays a product with cart controls
 *
 * @component
 * @example
 * <ProductCardReact product={product} baseUrl="/store" />
 *
 * @param {Product} props.product - Product data
 * @param {string} [props.baseUrl=""] - Base URL for links
 */
```

### 5.3 Create CONTRIBUTING.md

Include:
- Code style guide
- Commit message format
- PR review process
- Testing requirements

### 5.4 Create Architecture Decision Records

`docs/adr/001-state-management.md`
`docs/adr/002-islands-architecture.md`

---

## Verification Checklist

### Phase 1 Complete When:
- [ ] CSP header present in all pages
- [ ] No XSS possible via search input
- [ ] localStorage data validated
- [ ] Window globals removed
- [ ] set:html replaced with safe rendering

### Phase 2 Complete When:
- [ ] Single types file exists
- [ ] CartContext replaces window globals
- [ ] ProductService handles all data access
- [ ] Single CartControls component
- [ ] ErrorBoundary wraps React islands

### Phase 3 Complete When:
- [ ] Vitest configured and running
- [ ] >60% coverage on cart actions
- [ ] >60% coverage on validation utils
- [ ] >60% coverage on filter store
- [ ] CI runs tests on PR

### Phase 4 Complete When:
- [ ] Search debounced (300ms)
- [ ] ProductCard memoized
- [ ] Hydration directives optimized
- [ ] Cart lookups use Map
- [ ] Images responsive

### Phase 5 Complete When:
- [ ] README has all sections
- [ ] All exports have JSDoc
- [ ] CONTRIBUTING.md exists
- [ ] ADRs documented

---

## Resources

- [Astro Documentation](https://docs.astro.build)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Vitest Documentation](https://vitest.dev)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [Web Vitals](https://web.dev/vitals/)

---

*Generated from comprehensive code review on December 1, 2025*
