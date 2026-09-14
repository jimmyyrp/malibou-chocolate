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
  isSupabaseConfigured,
  isAdminConfigured,
  supabaseAdmin,
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

  // Muat katalog dari Supabase pada saat mount. Jika Supabase belum
  // dikonfigurasi / gagal, aplikasi tetap berjalan memakai katalog bawaan.
  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured() || !supabasePublic) {
      setLoaded(true);
      return;
    }
    const load = async () => {
      try {
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
        if (!cats.error && cats.data) {
          const slugById: Record<number, string> = {};
          const idBySlug: Record<string, number> = {};
          for (const row of cats.data as CategoryRow[]) {
            const id = Number(row.id);
            if (Number.isFinite(id) && row.slug) {
              slugById[id] = row.slug;
              idBySlug[row.slug] = id;
            }
          }
          catMapsRef.current = { slugById, idBySlug };
        }
        if (!prods.error && prods.data) {
          setProducts(
            prods.data.map((row) =>
              rowToProduct(row as ProductRow, catMapsRef.current)
            )
          );
        }
        setLoaded(true);
      } catch (err) {
        console.error('Gagal memuat produk dari Supabase:', err);
        if (!cancelled) setLoaded(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Jika konfigurasi Supabase tidak ada, tidak ada tulis; semua operasi
  // mutasi hanya mengubah state lokal (perilaku lama via state).
  const getDb = () => {
    if (!isSupabaseConfigured() || !supabaseAdmin) return null;
    return supabaseAdmin;
  };

  const save = useCallback((next: Product[]): Promise<boolean> => {
    setProducts(next);
    const db = getDb();
    if (!db) {
      if (isSupabaseConfigured() && !isAdminConfigured()) {
        setError('Secret key belum dikonfigurasi — perubahan hanya disimpan di peramban ini. Set env NEXT_PUBLIC_SUPABASE_SECRET_KEY lalu rebuild.');
      }
      return Promise.resolve(false);
    }
    return (async () => {
      try {
        const { error: upsertErr } = await db
          .from('products')
          .upsert(
            next.map((p) => productToRow(p, catMapsRef.current)),
            { onConflict: 'id' }
          );
        if (upsertErr) throw upsertErr;
        const { data, error: selErr } = await db.from('products').select('id');
        if (selErr) throw selErr;
        const keep = new Set(next.map((p) => p.id));
        const extras = (data ?? [])
          .map((r) => (r as { id: number }).id)
          .filter((id) => !keep.has(id));
        if (extras.length > 0) {
          const { error: delErr } = await db.from('products').delete().in('id', extras);
          if (delErr) throw delErr;
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Gagal menyimpan katalog ke Supabase: ${msg}`);
        console.error('Gagal menyimpan katalog ke Supabase:', err);
        return false;
      }
    })();
  }, []);

  const addProduct = useCallback((product: Product): Promise<boolean> => {
    setProducts((prev) => [...prev, product]);
    const db = getDb();
    if (!db) {
      if (isSupabaseConfigured() && !isAdminConfigured()) {
        setError('Secret key belum dikonfigurasi — produk hanya ditambahkan di peramban ini.');
      }
      return Promise.resolve(false);
    }
    return (async () => {
      try {
        const { error: writeErr } = await db
          .from('products')
          .insert(productToRow(product, catMapsRef.current));
        if (writeErr) {
          setError(`Gagal menambah produk ke Supabase: ${writeErr.message}`);
          console.error('Gagal menambah produk ke Supabase:', writeErr.message);
          return false;
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Gagal menambah produk ke Supabase: ${msg}`);
        console.error('Gagal menambah produk ke Supabase:', err);
        return false;
      }
    })();
  }, []);

  const updateProduct = useCallback((product: Product): Promise<boolean> => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? product : p))
    );
    const db = getDb();
    if (!db) {
      if (isSupabaseConfigured() && !isAdminConfigured()) {
        setError('Secret key belum dikonfigurasi — perubahan produk hanya disimpan di peramban ini.');
      }
      return Promise.resolve(false);
    }
    return (async () => {
      try {
        const { error: writeErr } = await db
          .from('products')
          .update(productToRow(product, catMapsRef.current))
          .eq('id', product.id);
        if (writeErr) {
          setError(`Gagal memperbarui produk di Supabase: ${writeErr.message}`);
          console.error('Gagal memperbarui produk di Supabase:', writeErr.message);
          return false;
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Gagal memperbarui produk di Supabase: ${msg}`);
        console.error('Gagal memperbarui produk di Supabase:', err);
        return false;
      }
    })();
  }, []);

  const deleteProducts = useCallback((ids: number[]): Promise<boolean> => {
    const idSet = new Set(ids);
    setProducts((prev) => prev.filter((p) => !idSet.has(p.id)));
    const db = getDb();
    if (!db || ids.length === 0) {
      if (ids.length > 0 && isSupabaseConfigured() && !isAdminConfigured()) {
        setError('Secret key belum dikonfigurasi — penghapusan hanya berlaku di peramban ini.');
      }
      return Promise.resolve(false);
    }
    return (async () => {
      try {
        const { error: writeErr } = await db.from('products').delete().in('id', ids);
        if (writeErr) {
          setError(`Gagal menghapus produk di Supabase: ${writeErr.message}`);
          console.error('Gagal menghapus produk di Supabase:', writeErr.message);
          return false;
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Gagal menghapus produk di Supabase: ${msg}`);
        console.error('Gagal menghapus produk di Supabase:', err);
        return false;
      }
    })();
  }, []);

  const resetToDefault = useCallback((): Promise<boolean> => {
    setProducts(PRODUCTS);
    const db = getDb();
    if (!db) {
      if (isSupabaseConfigured() && !isAdminConfigured()) {
        setError('Secret key belum dikonfigurasi — reset hanya berlaku di peramban ini.');
      }
      return Promise.resolve(false);
    }
    return (async () => {
      try {
        const defaultIds = new Set(PRODUCTS.map((p) => p.id));
        const { error: upsertErr } = await db
          .from('products')
          .upsert(
            [...PRODUCTS].map((p) => productToRow(p, catMapsRef.current)),
            { onConflict: 'id' }
          );
        if (upsertErr) throw upsertErr;
        const { data, error: selErr } = await db.from('products').select('id');
        if (selErr) throw selErr;
        const extras = (data ?? [])
          .map((r) => (r as { id: number }).id)
          .filter((id) => !defaultIds.has(id));
        if (extras.length > 0) {
          const { error: delErr } = await db.from('products').delete().in('id', extras);
          if (delErr) throw delErr;
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Gagal mereset katalog di Supabase: ${msg}`);
        console.error('Gagal mereset katalog di Supabase:', err);
        return false;
      }
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