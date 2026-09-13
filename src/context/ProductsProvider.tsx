'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import {
  loadProducts,
  resetProducts,
  saveProducts,
} from '../data/productsStore';

interface ProductsContextValue {
  products: Product[];
  loaded: boolean;
  save: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProducts: (ids: string[]) => void;
  resetToDefault: () => void;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProducts(loadProducts());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveProducts(products);
  }, [products, loaded]);

  const save = useCallback((next: Product[]) => setProducts(next), []);
  const addProduct = useCallback(
    (product: Product) => setProducts((prev) => [...prev, product]),
    []
  );
  const updateProduct = useCallback(
    (product: Product) =>
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      ),
    []
  );
  const deleteProducts = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setProducts((prev) => prev.filter((p) => !idSet.has(p.id)));
  }, []);
  const resetToDefault = useCallback(
    () => setProducts(resetProducts()),
    []
  );

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
    [products, loaded, save, addProduct, updateProduct, deleteProducts, resetToDefault]
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