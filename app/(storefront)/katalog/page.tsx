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
      {/* Page Header Band */}
      <section className="bg-[#FAF7F2] border-b border-[#2A140B]/8 pt-24 sm:pt-28 md:pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B87932] block mb-2">
            OUR CATALOG
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A140B] tracking-tight mb-3">
            Katalog Produk Malibou
          </h1>
          <p className="text-sm sm:text-base text-[#5E3622] max-w-2xl leading-relaxed">
            Seluruh koleksi olahan cokelat murni, bahan baku kakao Ranah Minang, dan varian
            khusus rendang — lengkap dengan pilihan kemasan retail maupun bulk.
          </p>
        </div>
      </section>

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