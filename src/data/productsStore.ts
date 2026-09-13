import { Product } from '../types';
import { PRODUCTS } from './products';

const STORAGE_KEY = 'malibou_products_v2';

type StoredData = { version: number; signature: string; products: Product[] };

/**
 * Signature katalog bawaan. Setiap perubahan pada daftar produk default
 * (nama, harga, jumlah) otomatis membuat cache lama di browser
 * pengunjung dianggap basi dan dibuang, sehingga katalog yang tampil
 * selalu versi terbaru — bukan produk lama dari localStorage.
 */
const DATA_SIGNATURE = PRODUCTS.map(
  (p) => `${p.id}:${p.name}:${p.price}`
).join('|');

export function loadProducts(): Product[] {
  if (typeof window === 'undefined') return PRODUCTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return PRODUCTS;

    const parsed = JSON.parse(raw) as StoredData;
    const isValid =
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray(parsed.products) &&
      parsed.signature === DATA_SIGNATURE;

    if (!isValid) {
      // Katalog bawaan sudah berubah atau data rusak → buang cache lama
      // agar produk lama tidak lagi tampil di katalog toko.
      window.localStorage.removeItem(STORAGE_KEY);
      return PRODUCTS;
    }

    return parsed.products as Product[];
  } catch (err) {
    console.error('Gagal memuat katalog dari penyimpanan:', err);
    return PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    const data: StoredData = { version: 1, signature: DATA_SIGNATURE, products };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Gagal menyimpan katalog ke penyimpanan:', err);
  }
}

export function resetProducts(): Product[] {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // abaikan
    }
  }
  return PRODUCTS;
}

export function nextProductId(products: Product[]): number {
  return Math.max(0, ...products.map((p) => p.id)) + 1;
}