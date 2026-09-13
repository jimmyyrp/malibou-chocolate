'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCatalog } from '../../../src/components/ProductCatalog';
import { useCart } from '../../../src/context/CartProvider';
import { CATEGORIES } from '../../../src/data/products';
import { ProductCategory } from '../../../src/types';

function KatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const rawKategori = searchParams.get('kategori');
  const kategoriFromUrl: ProductCategory | null = CATEGORIES.some((c) => c.id === rawKategori)
    ? (rawKategori as ProductCategory)
    : null;

  const [selectedCategory, setSelectedCategoryState] = useState<
    ProductCategory | 'all'
  >(kategoriFromUrl ?? 'all');

  // Sinkronkan pilihan kategori dengan query string URL.
  useEffect(() => {
    setSelectedCategoryState(kategoriFromUrl ?? 'all');
  }, [kategoriFromUrl]);

  const handleCategoryChange = (category: ProductCategory | 'all') => {
    setSelectedCategoryState(category);
    router.replace(category === 'all' ? '/katalog' : `/katalog?kategori=${category}`, {
      scroll: false,
    });
  };

  return (
    <>
      <ProductCatalog
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onSelectProduct={(p) => router.push(`/produk/${p.id}`)}
        onQuickAdd={(p) => addToCart(p, 1)}
      />
    </>
  );
}

export default function KatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 pb-24 text-center text-sm text-[#5E3622]">
          Memuat katalog…
        </div>
      }
    >
      <KatalogContent />
    </Suspense>
  );
}