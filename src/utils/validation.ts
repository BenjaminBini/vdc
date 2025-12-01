/**
 * Input validation utilities for security
 * Prevents XSS, injection attacks, and ensures data integrity
 */

/**
 * Maximum allowed length for search queries
 */
const MAX_SEARCH_LENGTH = 100;

/**
 * Maximum allowed length for product/cart item names
 */
const MAX_NAME_LENGTH = 200;

/**
 * Maximum quantity per cart item
 */
const MAX_QUANTITY = 99;

/**
 * Regex pattern for valid product/category IDs (alphanumeric with hyphens)
 */
const VALID_ID_PATTERN = /^[a-z0-9-]+$/;

/**
 * Sanitize search query to prevent XSS attacks
 * Removes HTML tags, dangerous characters, and limits length
 */
export function sanitizeSearchQuery(query: unknown): string {
  if (typeof query !== 'string') return '';

  return query
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'`]/g, '') // Remove dangerous characters
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
}

/**
 * Validate and sanitize a price range
 * Ensures min <= max and values are within absolute bounds
 */
export function validatePriceRange(
  min: number,
  max: number,
  absoluteMin: number,
  absoluteMax: number
): [number, number] {
  // Ensure values are finite numbers
  const safeMin = Number.isFinite(min) ? min : absoluteMin;
  const safeMax = Number.isFinite(max) ? max : absoluteMax;

  // Clamp to absolute bounds
  const clampedMin = Math.max(absoluteMin, Math.min(safeMin, absoluteMax));
  const clampedMax = Math.min(absoluteMax, Math.max(safeMax, absoluteMin));

  // Ensure min <= max
  if (clampedMin > clampedMax) {
    return [clampedMin, clampedMin];
  }

  return [clampedMin, clampedMax];
}

/**
 * Validate product/category ID format
 * Only allows lowercase alphanumeric characters and hyphens
 */
export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0 && VALID_ID_PATTERN.test(id);
}

/**
 * Validate a cart item structure
 * Ensures all required fields are present and have correct types
 */
export interface ValidatedCartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export function isValidCartItem(item: unknown): item is ValidatedCartItem {
  if (typeof item !== 'object' || item === null) return false;

  const obj = item as Record<string, unknown>;

  return (
    // ID must be a valid format
    isValidId(obj.id) &&
    // Name must be a non-empty string within length limit
    typeof obj.name === 'string' &&
    obj.name.length > 0 &&
    obj.name.length <= MAX_NAME_LENGTH &&
    // Price must be a positive finite number
    typeof obj.price === 'number' &&
    Number.isFinite(obj.price) &&
    obj.price >= 0 &&
    // Image must be a string (can be empty for fallback)
    typeof obj.image === 'string' &&
    // Quantity must be a positive integer within limits
    typeof obj.quantity === 'number' &&
    Number.isInteger(obj.quantity) &&
    obj.quantity > 0 &&
    obj.quantity <= MAX_QUANTITY
  );
}

/**
 * Sanitize a product name for display
 * Removes potentially dangerous characters while preserving readability
 */
export function sanitizeName(name: unknown): string {
  if (typeof name !== 'string') return '';

  return name
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"]/g, '') // Remove dangerous characters (keep single quotes for French)
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

/**
 * Validate quantity value
 * Returns a safe quantity or null if invalid
 */
export function validateQuantity(quantity: unknown): number | null {
  if (typeof quantity !== 'number') return null;
  if (!Number.isInteger(quantity)) return null;
  if (quantity < 0) return null;
  if (quantity > MAX_QUANTITY) return MAX_QUANTITY;
  return quantity;
}

/**
 * Validate price value
 * Returns a safe price or null if invalid
 */
export function validatePrice(price: unknown): number | null {
  if (typeof price !== 'number') return null;
  if (!Number.isFinite(price)) return null;
  if (price < 0) return null;
  // Round to 2 decimal places to avoid floating point issues
  return Math.round(price * 100) / 100;
}

/**
 * Validate an image URL
 * Allows local paths, data URIs, and HTTPS URLs
 */
export function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  if (url === '') return true; // Empty is allowed (will use fallback)

  // Allow local paths
  if (url.startsWith('/') && !url.startsWith('//')) return true;

  // Allow data URIs
  if (url.startsWith('data:image/')) return true;

  // Allow HTTPS URLs
  if (url.startsWith('https://')) return true;

  // Allow HTTP for development (will be upgraded)
  if (url.startsWith('http://')) return true;

  return false;
}

/**
 * Parse and validate cart data from localStorage
 * Returns validated items, filtering out any invalid entries
 */
export function parseAndValidateCart(jsonString: string | null): ValidatedCartItem[] {
  if (!jsonString) return [];

  try {
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed)) {
      console.warn('[Security] Invalid cart data format: expected array');
      return [];
    }

    const validItems = parsed.filter((item, index) => {
      const isValid = isValidCartItem(item);
      if (!isValid) {
        console.warn(`[Security] Invalid cart item at index ${index}, skipping`);
      }
      return isValid;
    });

    if (validItems.length !== parsed.length) {
      console.warn(
        `[Security] Removed ${parsed.length - validItems.length} invalid cart items`
      );
    }

    return validItems;
  } catch (error) {
    console.error('[Security] Failed to parse cart data:', error);
    return [];
  }
}
