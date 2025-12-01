import { describe, it, expect } from 'vitest';
import {
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
  searchProducts,
} from './ProductService';

describe('ProductService', () => {
  describe('getAllProducts', () => {
    it('returns an array of products', () => {
      const products = getAllProducts();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('products have required fields', () => {
      const products = getAllProducts();
      const product = products[0];

      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('inStock');
    });
  });

  describe('getProductById', () => {
    it('returns product for valid ID', () => {
      const products = getAllProducts();
      const firstProduct = products[0];
      const found = getProductById(firstProduct.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(firstProduct.id);
    });

    it('returns undefined for invalid ID', () => {
      const found = getProductById('non-existent-product');
      expect(found).toBeUndefined();
    });
  });

  describe('getProductsByCategory', () => {
    it('returns products filtered by category', () => {
      const products = getProductsByCategory('coffrets');

      expect(products.length).toBeGreaterThan(0);
      products.forEach((product) => {
        expect(product.category).toBe('coffrets');
      });
    });

    it('returns empty array for non-existent category', () => {
      const products = getProductsByCategory('non-existent-category');
      expect(products).toEqual([]);
    });
  });

  describe('getFeaturedProducts', () => {
    it('returns only featured products', () => {
      const featured = getFeaturedProducts();

      featured.forEach((product) => {
        expect(product.featured).toBe(true);
      });
    });
  });

  describe('getInStockProducts', () => {
    it('returns only in-stock products', () => {
      const inStock = getInStockProducts();

      inStock.forEach((product) => {
        expect(product.inStock).toBe(true);
      });
    });
  });

  describe('getCategories', () => {
    it('returns unique categories', () => {
      const categories = getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      // Check uniqueness
      const unique = new Set(categories);
      expect(unique.size).toBe(categories.length);
    });
  });

  describe('getAllPlants', () => {
    it('returns an array of plants', () => {
      const plants = getAllPlants();

      expect(Array.isArray(plants)).toBe(true);
      expect(plants.length).toBeGreaterThan(0);
    });

    it('plants have required fields', () => {
      const plants = getAllPlants();
      const plant = plants[0];

      expect(plant).toHaveProperty('id');
      expect(plant).toHaveProperty('name');
    });
  });

  describe('getPlantById', () => {
    it('returns plant for valid ID', () => {
      const plants = getAllPlants();
      const firstPlant = plants[0];
      const found = getPlantById(firstPlant.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(firstPlant.id);
    });

    it('returns undefined for invalid ID', () => {
      const found = getPlantById('non-existent-plant');
      expect(found).toBeUndefined();
    });
  });

  describe('filterProducts', () => {
    it('filters by category', () => {
      const products = getAllProducts();
      const filtered = filterProducts(products, { categories: ['coffrets'] });

      filtered.forEach((product) => {
        expect(product.category).toBe('coffrets');
      });
    });

    it('filters by price range', () => {
      const products = getAllProducts();
      const filtered = filterProducts(products, { priceRange: [10, 30] });

      filtered.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(10);
        expect(product.price).toBeLessThanOrEqual(30);
      });
    });

    it('filters by stock', () => {
      const products = getAllProducts();
      const filtered = filterProducts(products, { inStockOnly: true });

      filtered.forEach((product) => {
        expect(product.inStock).toBe(true);
      });
    });

    it('filters by search query', () => {
      const products = getAllProducts();
      const filtered = filterProducts(products, { searchQuery: 'huile' });

      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes('huile') ||
          product.description.toLowerCase().includes('huile') ||
          product.category.toLowerCase().includes('huile');
        expect(matchesSearch).toBe(true);
      });
    });

    it('combines multiple filters', () => {
      const products = getAllProducts();
      const filtered = filterProducts(products, {
        inStockOnly: true,
        priceRange: [0, 50],
      });

      filtered.forEach((product) => {
        expect(product.inStock).toBe(true);
        expect(product.price).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('sortProducts', () => {
    it('sorts by price ascending', () => {
      const products = getAllProducts().slice(0, 5);
      const sorted = sortProducts(products, 'price-asc');

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i - 1].price);
      }
    });

    it('sorts by price descending', () => {
      const products = getAllProducts().slice(0, 5);
      const sorted = sortProducts(products, 'price-desc');

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].price).toBeLessThanOrEqual(sorted[i - 1].price);
      }
    });

    it('sorts by name ascending', () => {
      const products = getAllProducts().slice(0, 5);
      const sorted = sortProducts(products, 'name-asc');

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].name.localeCompare(sorted[i - 1].name, 'fr')).toBeGreaterThanOrEqual(0);
      }
    });

    it('sorts by name descending', () => {
      const products = getAllProducts().slice(0, 5);
      const sorted = sortProducts(products, 'name-desc');

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].name.localeCompare(sorted[i - 1].name, 'fr')).toBeLessThanOrEqual(0);
      }
    });

    it('returns original order for default sort', () => {
      const products = getAllProducts().slice(0, 5);
      const sorted = sortProducts(products, 'default');

      expect(sorted).toEqual(products);
    });
  });

  describe('getPriceRange', () => {
    it('returns min and max prices', () => {
      const [min, max] = getPriceRange();

      expect(min).toBeGreaterThanOrEqual(0);
      expect(max).toBeGreaterThan(min);
    });

    it('calculates range for subset of products', () => {
      const products = getAllProducts().filter((p) => p.category === 'coffrets');
      const [min, max] = getPriceRange(products);

      products.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(min);
        expect(product.price).toBeLessThanOrEqual(max);
      });
    });

    it('returns default range for empty array', () => {
      const [min, max] = getPriceRange([]);

      expect(min).toBe(0);
      expect(max).toBe(100);
    });
  });

  describe('searchProducts', () => {
    it('finds products by name', () => {
      const results = searchProducts('coffret');

      expect(results.length).toBeGreaterThan(0);
      results.forEach((product) => {
        const hasMatch =
          product.name.toLowerCase().includes('coffret') ||
          product.description.toLowerCase().includes('coffret');
        expect(hasMatch).toBe(true);
      });
    });

    it('returns all products for empty query', () => {
      const all = getAllProducts();
      const results = searchProducts('');

      expect(results.length).toBe(all.length);
    });

    it('is case-insensitive', () => {
      const lower = searchProducts('huile');
      const upper = searchProducts('HUILE');
      const mixed = searchProducts('HuIlE');

      expect(lower.length).toBe(upper.length);
      expect(lower.length).toBe(mixed.length);
    });
  });
});
