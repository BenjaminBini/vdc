/**
 * Formatting utilities for consistent display across the app
 */

/**
 * Format a price for display in French format (comma as decimal separator)
 */
export function formatPrice(price: number, currency = '€'): string {
  return `${price.toFixed(2).replace('.', ',')} ${currency}`;
}

/**
 * Format a number with French locale
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('fr-FR');
}
