import type { ImageMetadata } from 'astro';

// Import all plant images from assets
const plantImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/plants/*.{jpg,jpeg,png,webp}', { eager: true });

// Import all product images from assets (if any remain there)
const productImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/products/*.{jpg,jpeg,png,webp}', { eager: true });

/**
 * Get plant image from assets folder
 * Falls back to the original path if not found in assets
 */
export function getPlantImage(imagePath: string): ImageMetadata | string {
  const fileName = imagePath.split('/').pop();
  const key = `/src/assets/images/plants/${fileName}`;
  return plantImages[key]?.default || imagePath;
}

/**
 * Get product image from assets folder
 * Falls back to the original path if not found in assets
 */
export function getProductImage(imagePath: string): ImageMetadata | string {
  if (imagePath.startsWith('http')) return imagePath;
  const fileName = imagePath.split('/').pop();
  const key = `/src/assets/images/products/${fileName}`;
  return productImages[key]?.default || imagePath;
}

/**
 * Prepend baseUrl to local image paths (for public folder images)
 */
export function getPublicImageUrl(imagePath: string, baseUrl: string): string {
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/') && !imagePath.startsWith('//')) {
    return `${baseUrl}${imagePath}`;
  }
  return imagePath;
}
