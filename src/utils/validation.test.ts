import { describe, it, expect } from 'vitest';
import {
  sanitizeSearchQuery,
  validatePriceRange,
  isValidId,
  isValidCartItem,
  sanitizeName,
  validateQuantity,
  validatePrice,
  isValidImageUrl,
  parseAndValidateCart,
} from './validation';

describe('sanitizeSearchQuery', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeSearchQuery(null)).toBe('');
    expect(sanitizeSearchQuery(undefined)).toBe('');
    expect(sanitizeSearchQuery(123)).toBe('');
    expect(sanitizeSearchQuery({})).toBe('');
  });

  it('removes HTML tags', () => {
    expect(sanitizeSearchQuery('<script>alert("xss")</script>')).toBe('alert(xss)');
    expect(sanitizeSearchQuery('<b>bold</b>')).toBe('bold');
  });

  it('removes dangerous characters', () => {
    expect(sanitizeSearchQuery('test<>"\'')).toBe('test');
    expect(sanitizeSearchQuery('`backticks`')).toBe('backticks');
  });

  it('trims whitespace', () => {
    expect(sanitizeSearchQuery('  test  ')).toBe('test');
  });

  it('truncates to max length', () => {
    const longString = 'a'.repeat(150);
    expect(sanitizeSearchQuery(longString).length).toBe(100);
  });

  it('preserves valid search queries', () => {
    expect(sanitizeSearchQuery('huile de bourrache')).toBe('huile de bourrache');
    expect(sanitizeSearchQuery('crème mains')).toBe('crème mains');
  });
});

describe('validatePriceRange', () => {
  it('returns clamped values within bounds', () => {
    expect(validatePriceRange(10, 50, 0, 100)).toEqual([10, 50]);
  });

  it('clamps min to absolute bounds', () => {
    expect(validatePriceRange(-10, 50, 0, 100)).toEqual([0, 50]);
  });

  it('clamps max to absolute bounds', () => {
    expect(validatePriceRange(10, 150, 0, 100)).toEqual([10, 100]);
  });

  it('handles min > max by returning same value', () => {
    expect(validatePriceRange(80, 20, 0, 100)).toEqual([80, 80]);
  });

  it('handles non-finite numbers', () => {
    expect(validatePriceRange(NaN, 50, 0, 100)).toEqual([0, 50]);
    expect(validatePriceRange(10, Infinity, 0, 100)).toEqual([10, 100]);
  });
});

describe('isValidId', () => {
  it('returns true for valid IDs', () => {
    expect(isValidId('huile-bourrache')).toBe(true);
    expect(isValidId('coffret-123')).toBe(true);
    expect(isValidId('savon')).toBe(true);
  });

  it('returns false for invalid IDs', () => {
    expect(isValidId('')).toBe(false);
    expect(isValidId('Has Spaces')).toBe(false);
    expect(isValidId('UPPERCASE')).toBe(false);
    expect(isValidId('special_chars!')).toBe(false);
    expect(isValidId(null)).toBe(false);
    expect(isValidId(123)).toBe(false);
  });
});

describe('isValidCartItem', () => {
  const validItem = {
    id: 'huile-bourrache',
    name: 'Huile de Bourrache',
    price: 12.5,
    image: '/images/products/huile.webp',
    quantity: 2,
  };

  it('returns true for valid cart items', () => {
    expect(isValidCartItem(validItem)).toBe(true);
  });

  it('returns false for null or non-object', () => {
    expect(isValidCartItem(null)).toBe(false);
    expect(isValidCartItem(undefined)).toBe(false);
    expect(isValidCartItem('string')).toBe(false);
  });

  it('returns false for invalid ID', () => {
    expect(isValidCartItem({ ...validItem, id: '' })).toBe(false);
    expect(isValidCartItem({ ...validItem, id: 'INVALID' })).toBe(false);
  });

  it('returns false for invalid name', () => {
    expect(isValidCartItem({ ...validItem, name: '' })).toBe(false);
    expect(isValidCartItem({ ...validItem, name: 123 })).toBe(false);
  });

  it('returns false for invalid price', () => {
    expect(isValidCartItem({ ...validItem, price: -10 })).toBe(false);
    expect(isValidCartItem({ ...validItem, price: NaN })).toBe(false);
    expect(isValidCartItem({ ...validItem, price: 'free' })).toBe(false);
  });

  it('returns false for invalid quantity', () => {
    expect(isValidCartItem({ ...validItem, quantity: 0 })).toBe(false);
    expect(isValidCartItem({ ...validItem, quantity: -1 })).toBe(false);
    expect(isValidCartItem({ ...validItem, quantity: 100 })).toBe(false);
    expect(isValidCartItem({ ...validItem, quantity: 1.5 })).toBe(false);
  });

  it('returns false for invalid image type', () => {
    expect(isValidCartItem({ ...validItem, image: 123 })).toBe(false);
  });
});

describe('sanitizeName', () => {
  it('removes HTML tags and dangerous characters', () => {
    expect(sanitizeName('<script>alert("xss")</script>')).toBe('alert(xss)');
  });

  it('removes dangerous characters but keeps single quotes', () => {
    expect(sanitizeName('Test<>')).toBe('Test');
    expect(sanitizeName("L'huile")).toBe("L'huile");
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeName(null)).toBe('');
    expect(sanitizeName(123)).toBe('');
  });
});

describe('validateQuantity', () => {
  it('returns valid quantities', () => {
    expect(validateQuantity(1)).toBe(1);
    expect(validateQuantity(50)).toBe(50);
    expect(validateQuantity(99)).toBe(99);
  });

  it('caps at max quantity', () => {
    expect(validateQuantity(100)).toBe(99);
    expect(validateQuantity(1000)).toBe(99);
  });

  it('returns null for invalid values', () => {
    expect(validateQuantity(-1)).toBe(null);
    expect(validateQuantity(1.5)).toBe(null);
    expect(validateQuantity('5')).toBe(null);
    expect(validateQuantity(null)).toBe(null);
  });

  it('allows zero quantity', () => {
    expect(validateQuantity(0)).toBe(0);
  });
});

describe('validatePrice', () => {
  it('returns valid prices rounded to 2 decimals', () => {
    expect(validatePrice(12.5)).toBe(12.5);
    expect(validatePrice(12.999)).toBe(13);
    expect(validatePrice(0)).toBe(0);
  });

  it('returns null for invalid prices', () => {
    expect(validatePrice(-10)).toBe(null);
    expect(validatePrice(NaN)).toBe(null);
    expect(validatePrice(Infinity)).toBe(null);
    expect(validatePrice('10')).toBe(null);
  });
});

describe('isValidImageUrl', () => {
  it('allows local paths', () => {
    expect(isValidImageUrl('/images/product.webp')).toBe(true);
  });

  it('allows data URIs', () => {
    expect(isValidImageUrl('data:image/png;base64,abc123')).toBe(true);
  });

  it('allows HTTPS URLs', () => {
    expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
  });

  it('allows HTTP URLs', () => {
    expect(isValidImageUrl('http://localhost/image.jpg')).toBe(true);
  });

  it('allows empty strings', () => {
    expect(isValidImageUrl('')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(isValidImageUrl('//protocol-relative.com')).toBe(false);
    expect(isValidImageUrl('javascript:alert(1)')).toBe(false);
    expect(isValidImageUrl('ftp://server/file')).toBe(false);
    expect(isValidImageUrl(null)).toBe(false);
  });
});

describe('parseAndValidateCart', () => {
  it('returns empty array for null input', () => {
    expect(parseAndValidateCart(null)).toEqual([]);
  });

  it('returns empty array for invalid JSON', () => {
    expect(parseAndValidateCart('not json')).toEqual([]);
  });

  it('returns empty array for non-array JSON', () => {
    expect(parseAndValidateCart('{"foo": "bar"}')).toEqual([]);
  });

  it('filters out invalid items', () => {
    const data = JSON.stringify([
      { id: 'valid-item', name: 'Valid', price: 10, image: '/img.jpg', quantity: 1 },
      { id: 'INVALID', name: 'Bad ID', price: 10, image: '/img.jpg', quantity: 1 },
      { id: 'another-valid', name: 'Another', price: 20, image: '/img.jpg', quantity: 2 },
    ]);

    const result = parseAndValidateCart(data);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('valid-item');
    expect(result[1].id).toBe('another-valid');
  });

  it('returns all valid items', () => {
    const items = [
      { id: 'item-1', name: 'Item 1', price: 10, image: '/img1.jpg', quantity: 1 },
      { id: 'item-2', name: 'Item 2', price: 20, image: '/img2.jpg', quantity: 2 },
    ];

    const result = parseAndValidateCart(JSON.stringify(items));
    expect(result).toEqual(items);
  });
});
