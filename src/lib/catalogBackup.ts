import { Product, ProductCategory } from '../types';
import { CATEGORIES } from '../data/products';

/**
 * Utilitas cadangan (backup) katalog Malibou.
 *
 * - `buildBackupData` / `downloadBackup` -> membuat berkas JSON cadangan
 *   dari produk yang sedang aktif (di dashboard) lalu mengunduhnya.
 * - `parseBackupText` -> memvalidasi & mengurai berkas cadangan untuk
 *   ditampilkan sebelum dipulihkan.
 * - Riwayat cadangan disimpan per-peramban di localStorage sehingga admin
 *   dapat mengunduh ulang / memulihkan cadangan lama.
 */

export const BACKUP_TYPE = 'malibou-catalog-backup';

export interface CatalogBackup {
  type: typeof BACKUP_TYPE;
  version: number;
  createdAt: string;
  createdBy: string;
  categories: typeof CATEGORIES;
  products: Product[];
}

export interface BackupHistoryEntry {
  id: string;
  createdAt: string;
  fileName: string;
  productCount: number;
  totalValue: number;
  data: CatalogBackup;
}

const HISTORY_KEY = 'malibou_backup_history';
const MAX_HISTORY = 20;

export const backupFileName = (date: Date = new Date()): string => {
  const stamp = date.toISOString().slice(0, 10);
  const time = date.toISOString().slice(11, 19).replace(/:/g, '-');
  return `malibou-cadangan-${stamp}-${time}.json`;
};

export function buildBackupData(
  products: Product[],
  createdBy: string
): CatalogBackup {
  return {
    type: BACKUP_TYPE,
    version: 1,
    createdAt: new Date().toISOString(),
    createdBy: createdBy || 'admin',
    categories: CATEGORIES,
    products: products.map((p) => ({ ...p })),
  };
}

/** Buat berkas cadangan dan langsung picu unduhan di peramban. */
export function downloadBackup(
  products: Product[],
  createdBy: string
): CatalogBackup {
  const data = buildBackupData(products, createdBy);
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFileName(new Date(data.createdAt));
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return data;
}

const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as ProductCategory[];

export function isValidCategory(cat: unknown): cat is ProductCategory {
  return typeof cat === 'string' && (CATEGORY_IDS as string[]).includes(cat);
}

/**
 * Urai & validasi teks JSON cadangan. Melempar Error dengan pesan ramah
 * bila format tidak dikenali / rusak.
 */
export function parseBackupText(text: string): {
  data: CatalogBackup;
  products: Product[];
} {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Berkas bukan JSON yang valid.');
  }
  if (!raw || typeof raw !== 'object') {
    throw new Error('Isi berkas cadangan tidak dikenali.');
  }

  const obj = raw as Record<string, unknown>;
  if (obj.type !== BACKUP_TYPE) {
    throw new Error(
      'Berkas ini bukan cadangan katalog Malibou (format tidak dikenali).'
    );
  }
  if (!Array.isArray(obj.products)) {
    throw new Error('Cadangan tidak memuat daftar produk.');
  }

  const products = (obj.products as unknown[]).map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const rawCategory = isValidCategory(row.category)
      ? row.category
      : 'chocolate-bar';
    const categoryName =
      typeof row.categoryName === 'string' && row.categoryName.trim()
        ? row.categoryName
        : CATEGORIES.find((c) => c.id === rawCategory)?.name ?? rawCategory;
    return {
      id: Number.isFinite(Number(row.id)) ? Number(row.id) : 0,
      name:
        typeof row.name === 'string' && row.name.trim()
          ? row.name.trim()
          : 'Produk Tanpa Nama',
      category: rawCategory,
      categoryName,
      price: Number.isFinite(Number(row.price)) ? Number(row.price) : 0,
      unit: typeof row.unit === 'string' ? row.unit : undefined,
      weight: typeof row.weight === 'string' ? row.weight : undefined,
      description: typeof row.description === 'string' ? row.description : '',
      imageUrl: typeof row.imageUrl === 'string' ? row.imageUrl : '',
      featured: row.featured === true,
    } as Product;
  });

  const backup: CatalogBackup = {
    type: BACKUP_TYPE,
    version:
      typeof obj.version === 'number' && obj.version > 0 ? obj.version : 1,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : '',
    createdBy: typeof obj.createdBy === 'string' ? obj.createdBy : 'admin',
    categories: CATEGORIES,
    products,
  };

  return { data: backup, products };
}

/** Hitung ringkasan nilai katalog (total harga). */
export const backupTotalValue = (products: Product[]): number =>
  products.reduce((s, p) => s + (p.price || 0), 0);

/** Simpan satu entri riwayat cadangan ke localStorage. */
export function addBackupHistoryEntry(entry: BackupHistoryEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const list = loadBackupHistory();
    list.unshift(entry);
    if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Gagal menyimpan riwayat cadangan:', err);
  }
}

export function loadBackupHistory(): BackupHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BackupHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Gagal memuat riwayat cadangan:', err);
    return [];
  }
}

export function removeBackupHistoryEntry(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = loadBackupHistory().filter((e) => e.id !== id);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Gagal menghapus riwayat cadangan:', err);
  }
}