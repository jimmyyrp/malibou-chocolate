'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Product, ProductCategory } from '../types';
import { CATEGORIES, PRODUCTS } from '../data/products';
import {
  adminApi,
  isSupabaseConfigured,
  supabasePublic,
} from '../lib/supabase';

interface ProductsContextValue {
  products: Product[];
  loaded: boolean;
  /** Terakhir terjadi error saat mutasi (save/add/update/delete). */
  error: string | null;
  /** Bersihkan notifikasi error. */
  clearError: () => void;
  /**
   * Simpan batch produk. Resolusi true bila tulis ke Supabase berhasil
   * (atau Supabase tidak dikonfigurasi — hanya state lokal).
   */
  save: (products: Product[]) => Promise<boolean>;
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProducts: (ids: number[]) => Promise<boolean>;
  resetToDefault: () => Promise<boolean>;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

// Bentuk baris di tabel public.products (Supabase)
interface ProductRow {
  id: number;
  name: string;
  category_id: number | string;
  price: number;
  unit: string | null;
  weight: string | null;
  description: string;
  image_url: string;
  featured: boolean | null;
  sort_order: number | null;
}

interface CategoryRow {
  id: number | string;
  slug: string;
  name: string;
}

interface CategoryMaps {
  slugById: Record<number, string>;
  idBySlug: Record<string, number>;
}

const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.name])
);

// Kunci fallback jika tabel kategori tidak bisa dimuat: karena categories.id
// urutannya selalu mengikuti sort_order (baru) atau sama dengan slug (lama),
// pemetaan ini kompatibel dengan skema sebelum maupun sesudah migrasi 0008.
const DEFAULT_CATEGORY_MAPS: CategoryMaps = {
  slugById: Object.fromEntries(
    CATEGORIES.map((c, index) => [index + 1, c.id])
  ),
  idBySlug: Object.fromEntries(
    CATEGORIES.map((c, index) => [c.id, index + 1])
  ),
};

function categoryIdToSlug(rid: number | string, maps: CategoryMaps): ProductCategory {
  if (typeof rid === 'number') {
    const slug = maps.slugById[rid] ?? DEFAULT_CATEGORY_MAPS.slugById[rid];
    return (slug ?? String(rid)) as ProductCategory;
  }
  if (CATEGORY_NAMES[rid]) return rid as ProductCategory;
  const slug = maps.slugById[rid as unknown as number] ?? rid;
  return slug as ProductCategory;
}

function categorySlugToId(slug: string, maps: CategoryMaps): number | string {
  const id =
    maps.idBySlug[slug] ??
    DEFAULT_CATEGORY_MAPS.idBySlug[slug] ??
    (CATEGORY_NAMES[slug] ? slug : 1);
  return id;
}

function rowToProduct(row: ProductRow, maps: CategoryMaps): Product {
  const category = categoryIdToSlug(row.category_id, maps);
  return {
    id: row.id,
    name: row.name,
    category,
    categoryName: CATEGORY_NAMES[category] ?? category,
    price: row.price,
    unit: row.unit ?? undefined,
    weight: row.weight ?? undefined,
    description: row.description,
    imageUrl: row.image_url,
    featured: row.featured ?? false,
  };
}

function productToRow(p: Product, maps: CategoryMaps) {
  return {
    id: p.id,
    name: p.name,
    category_id: categorySlugToId(p.category, maps),
    price: p.price,
    unit: p.unit ?? null,
    weight: p.weight ?? null,
    description: p.description,
    image_url: p.imageUrl,
    featured: p.featured ?? false,
  };
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const catMapsRef = useRef(DEFAULT_CATEGORY_MAPS);

  // Muat katalog pada saat mount. Prioritas: Supabase client (publishable
  // key) bila tersedia; bila tidak / gagal, jatuh ke /api/catalog agar data
  // tetap terbaca di lingkungan tanpa env NEXT_PUBLIC_*. Jika semua gagal,
  // aplikasi tetap berjalan memakai katalog bawaan.
  useEffect(() => {
    let cancelled = false;

    const applyRows = (
      catRows: CategoryRow[],
      prodRows: ProductRow[]
    ): boolean => {
      if (cancelled) return true;
      const slugById: Record<number, string> = {};
      const idBySlug: Record<string, number> = {};
      for (const row of catRows) {
        const id = Number(row.id);
        if (Number.isFinite(id) && row.slug) {
          slugById[id] = row.slug;
          idBySlug[row.slug] = id;
        }
      }
      catMapsRef.current = { slugById, idBySlug };
      setProducts(prodRows.map((row) => rowToProduct(row, catMapsRef.current)));
      setLoaded(true);
      return true;
    };

    const load = async (silent = false) => {
      try {
        // 1) Coba klien Supabase (kredensial publishable di bundle browser).
        if (supabasePublic) {
          const [cats, prods] = await Promise.all([
            supabasePublic
              .from('categories')
              .select('id, slug, name')
              .order('sort_order', { ascending: true }),
            supabasePublic
              .from('products')
              .select('*')
              .order('sort_order', { ascending: true }),
          ]);
          if (cancelled) return;
          if (!cats.error && !prods.error && cats.data && prods.data) {
            applyRows(cats.data, prods.data as ProductRow[]);
            return;
          }
        }

        // 2) Fallback: baca katalog lewat route server & service key.
        const res = await fetch('/api/catalog', { cache: 'no-store' });
        if (cancelled) return;
        if (res.ok) {
          const body = (await res.json().catch(() => null)) as {
            ok?: boolean;
            categories?: CategoryRow[];
            products?: ProductRow[];
          } | null;
          if (body?.ok && body.categories && body.products) {
            applyRows(body.categories, body.products);
            return;
          }
        }
        setLoaded(true);
      } catch (err) {
        console.error('Gagal memuat produk dari Supabase:', err);
        if (!cancelled) setLoaded(true);
        if (!silent) {
          // abaikan — muatan awal tetap memakai katalog bawaan
        }
      }
    };
    load();

    // Muat ulang katalog secara senyap saat tab kembali terlihat, sehingga
    // perubahan yang dibuat admin (produk baru/edit/hapus) langsung tampil
    // di toko tanpa perlu refresh manual. Frame waktu 30 dtk mencegah muat
    // ulang berlebihan saat berpindah antar-tab.
    let lastVisibleAt = Date.now();
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastVisibleAt < 30_000) return;
      lastVisibleAt = now;
      void load(true);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Semua operasi tulis diarahkan ke API route server-side agar secret key
  // Supabase tidak pernah masuk ke bundle browser. Bila server tidak
  // terjangkau / belum dikonfigurasi, mutasi hanya mengubah state lokal.
  const save = useCallback((next: Product[]): Promise<boolean> => {
    setProducts(next);
    if (!isSupabaseConfigured()) return Promise.resolve(false);
    return (async () => {
      const res = await adminApi.saveAll(
        next.map((p) => productToRow(p, catMapsRef.current))
      );
      if (!res.ok) {
        setError(`Gagal menyimpan katalog ke Supabase: ${res.error}`);
        console.error('Gagal menyimpan katalog ke Supabase:', res.error);
        return false;
      }
      return true;
    })();
  }, []);

  const addProduct = useCallback((product: Product): Promise<boolean> => {
    setProducts((prev) => [...prev, product]);
    if (!isSupabaseConfigured()) return Promise.resolve(false);
    return (async () => {
      const res = await adminApi.add(
        productToRow(product, catMapsRef.current)
      );
      if (!res.ok) {
        setError(`Gagal menambah produk ke Supabase: ${res.error}`);
        console.error('Gagal menambah produk ke Supabase:', res.error);
        return false;
      }
      return true;
    })();
  }, []);

  const updateProduct = useCallback((product: Product): Promise<boolean> => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? product : p))
    );
    if (!isSupabaseConfigured()) return Promise.resolve(false);
    return (async () => {
      const res = await adminApi.update(
        product.id,
        productToRow(product, catMapsRef.current)
      );
      if (!res.ok) {
        setError(`Gagal memperbarui produk di Supabase: ${res.error}`);
        console.error('Gagal memperbarui produk di Supabase:', res.error);
        return false;
      }
      return true;
    })();
  }, []);

  const deleteProducts = useCallback((ids: number[]): Promise<boolean> => {
    const idSet = new Set(ids);
    setProducts((prev) => prev.filter((p) => !idSet.has(p.id)));
    if (!isSupabaseConfigured() || ids.length === 0) {
      return Promise.resolve(false);
    }
    return (async () => {
      const res = await adminApi.remove(ids);
      if (!res.ok) {
        setError(`Gagal menghapus produk di Supabase: ${res.error}`);
        console.error('Gagal menghapus produk di Supabase:', res.error);
        return false;
      }
      return true;
    })();
  }, []);

  const resetToDefault = useCallback((): Promise<boolean> => {
    setProducts(PRODUCTS);
    if (!isSupabaseConfigured()) return Promise.resolve(false);
    return (async () => {
      const res = await adminApi.saveAll(
        [...PRODUCTS].map((p) => productToRow(p, catMapsRef.current))
      );
      if (!res.ok) {
        setError(`Gagal mereset katalog di Supabase: ${res.error}`);
        console.error('Gagal mereset katalog di Supabase:', res.error);
        return false;
      }
      return true;
    })();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<ProductsContextValue>(
    () => ({
      products,
      loaded,
      error,
      clearError,
      save,
      addProduct,
      updateProduct,
      deleteProducts,
      resetToDefault,
    }),
    [
      products,
      loaded,
      error,
      clearError,
      save,
      addProduct,
      updateProduct,
      deleteProducts,
      resetToDefault,
    ]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts harus digunakan di dalam <ProductsProvider>.');
  }
  return ctx;
}