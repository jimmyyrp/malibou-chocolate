'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Product, ProductCategory } from '../types';
import { CATEGORIES, PRODUCTS } from '../data/products';
import {
  isSupabaseConfigured,
  supabaseAdmin,
  supabasePublic,
} from '../lib/supabase';

interface ProductsContextValue {
  products: Product[];
  loaded: boolean;
  save: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProducts: (ids: number[]) => void;
  resetToDefault: () => void;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

// Bentuk baris di tabel public.products (Supabase)
interface ProductRow {
  id: number;
  name: string;
  category_id: string;
  price: number;
  unit: string | null;
  weight: string | null;
  description: string;
  image_url: string;
  featured: boolean | null;
  sort_order: number | null;
}

const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.name])
);

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category_id as ProductCategory,
    categoryName: CATEGORY_NAMES[row.category_id] ?? row.category_id,
    price: row.price,
    unit: row.unit ?? undefined,
    weight: row.weight ?? undefined,
    description: row.description,
    imageUrl: row.image_url,
    featured: row.featured ?? false,
  };
}

function productToRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    category_id: p.category,
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
        const { data, error } = await supabasePublic
          .from('products')
          .select('*')
          .order('sort_order', { ascending: true });
        if (cancelled) return;
        if (!error && data) {
          setProducts(data.map((row) => rowToProduct(row as ProductRow)));
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

  const save = useCallback((next: Product[]) => {
    setProducts(next);
    const db = getDb();
    if (!db) return;
    void (async () => {
      try {
        await db
          .from('products')
          .upsert(next.map((p) => productToRow(p)), { onConflict: 'id' });
        const { data } = await db.from('products').select('id');
        const keep = new Set(next.map((p) => p.id));
        const extras = (data ?? [])
          .map((r) => (r as { id: number }).id)
          .filter((id) => !keep.has(id));
        if (extras.length > 0) {
          await db.from('products').delete().in('id', extras);
        }
      } catch (err) {
        console.error('Gagal menyimpan katalog ke Supabase:', err);
      }
    })();
  }, []);

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product]);
    const db = getDb();
    if (!db) return;
    void (async () => {
      try {
        const { error } = await db.from('products').insert(productToRow(product));
        if (error)
          console.error('Gagal menambah produk ke Supabase:', error.message);
      } catch (err) {
        console.error('Gagal menambah produk ke Supabase:', err);
      }
    })();
  }, []);

  const updateProduct = useCallback((product: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? product : p))
    );
    const db = getDb();
    if (!db) return;
    void (async () => {
      try {
        const { error } = await db
          .from('products')
          .update(productToRow(product))
          .eq('id', product.id);
        if (error)
          console.error('Gagal memperbarui produk di Supabase:', error.message);
      } catch (err) {
        console.error('Gagal memperbarui produk di Supabase:', err);
      }
    })();
  }, []);

  const deleteProducts = useCallback((ids: number[]) => {
    const idSet = new Set(ids);
    setProducts((prev) => prev.filter((p) => !idSet.has(p.id)));
    const db = getDb();
    if (!db || ids.length === 0) return;
    void (async () => {
      try {
        const { error } = await db.from('products').delete().in('id', ids);
        if (error)
          console.error('Gagal menghapus produk di Supabase:', error.message);
      } catch (err) {
        console.error('Gagal menghapus produk di Supabase:', err);
      }
    })();
  }, []);

  const resetToDefault = useCallback(() => {
    setProducts(PRODUCTS);
    const db = getDb();
    if (!db) return;
    void (async () => {
      try {
        const defaultIds = new Set(PRODUCTS.map((p) => p.id));
        await db
          .from('products')
          .upsert([...PRODUCTS].map((p) => productToRow(p)), {
            onConflict: 'id',
          });
        const { data } = await db.from('products').select('id');
        const extras = (data ?? [])
          .map((r) => (r as { id: number }).id)
          .filter((id) => !defaultIds.has(id));
        if (extras.length > 0) {
          await db.from('products').delete().in('id', extras);
        }
      } catch (err) {
        console.error('Gagal mereset katalog di Supabase:', err);
      }
    })();
  }, []);

  const value = useMemo<ProductsContextValue>(
    () => ({
      products,
      loaded,
      save,
      addProduct,
      updateProduct,
      deleteProducts,
      resetToDefault,
    }),
    [
      products,
      loaded,
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