import { PRODUCTS } from '@/data/products';
import { Product } from '@/types';

const LEGACY_CODE_TO_ID: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (let i = 1; i <= 30; i += 1) {
    map[`PRD${String(i).padStart(3, '0')}`] = i;
  }
  map['PRD029'] = 18;
  map['PRD030'] = 19;
  map['PRD018'] = 20;
  return map;
})();

export function resolveProductByParam(rawParam: string | undefined): Product | undefined {
  const trimmed = String(rawParam ?? '').trim();
  if (!trimmed) return undefined;

  const numericId = Number(trimmed);
  if (Number.isFinite(numericId) && numericId > 0) {
    return PRODUCTS.find((p) => p.id === numericId);
  }

  const legacyId = LEGACY_CODE_TO_ID[trimmed.toUpperCase()];
  return legacyId ? PRODUCTS.find((p) => p.id === legacyId) : undefined;
}

export function canonicalProductUrl(rawParam: string): string | null {
  const product = resolveProductByParam(rawParam);
  return product ? `/produk/${product.id}` : null;
}