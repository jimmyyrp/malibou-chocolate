import { Product } from '@/types';

export const MAX_PRODUCT_IMAGES = 3;

/**
 * Daftar gambar produk yang efektif. Jika `images` kosong/undefined,
 * cukup memakai `imageUrl` sebagai satu-satunya foto (fallback data lama).
 */
export function productImages(product: Pick<Product, 'imageUrl' | 'images'>): string[] {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images.slice(0, MAX_PRODUCT_IMAGES);
  }
  return product.imageUrl ? [product.imageUrl] : [];
}