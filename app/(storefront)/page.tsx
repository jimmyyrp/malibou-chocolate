'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Hero } from '../../src/components/Hero';
import { QuickCategory } from '../../src/components/QuickCategory';
import { CocoaSection } from '../../src/components/CocoaSection';
import { RendangSection } from '../../src/components/RendangSection';
import { WhyMalibou } from '../../src/components/WhyMalibou';
import { AboutMalibou } from '../../src/components/AboutMalibou';
import { CtaOrder } from '../../src/components/CtaOrder';
import { ProductCard } from '../../src/components/ProductCard';
import { useProducts } from '../../src/context/ProductsProvider';
import { useCart } from '../../src/context/CartProvider';
import { ProductCategory } from '../../src/types';

function FeaturedProducts() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const router = useRouter();

  const featured = products
    .filter((p) => p.featured)
    .sort((a, b) => a.price - b.price)
    .slice(0, 8);

  return (
    <section id="featured" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#2A140B]/8 text-left">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B87932] block mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Produk Pilihan
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A140B] tracking-tight">
            Koleksi Unggulan Malibou
          </h2>
          <p className="text-sm sm:text-base text-[#5E3622] mt-1 max-w-xl">
            Sajian pilihan dari seluruh katalog — cokelat batangan murni, minuman
            cokelat, bahan kakao, hingga varian rendang spesial khas Malibou.
          </p>
        </div>

        <button
          onClick={() => router.push('/katalog')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B87932] hover:text-[#2A140B] transition-colors flex-shrink-0"
        >
          <span>Lihat Semua di Katalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
        {featured.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={(p) => router.push(`/produk/${p.id}`)}
            onQuickAdd={(p) => addToCart(p, 1)}
          />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { openCart } = useCart();

  const goToCatalog = (category?: ProductCategory) => {
    router.push(category ? `/katalog?kategori=${category}` : '/katalog');
  };

  const goToProduct = (id: number) => {
    router.push(`/produk/${id}`);
  };

  return (
    <>
      <Hero
        onExploreProducts={() => goToCatalog()}
        onOpenOrderModal={() => openCart()}
      />

      <QuickCategory onSelectCategory={(cat) => goToCatalog(cat)} />

      <FeaturedProducts />

      <CocoaSection
        onExploreCocoa={() => goToCatalog('cocoa-ingredients')}
        onSelectProduct={(p) => goToProduct(p.id)}
      />

      <RendangSection
        onViewRendangCatalog={() => goToCatalog('rendang')}
        onSelectProduct={(p) => goToProduct(p.id)}
      />

      <WhyMalibou />

      <AboutMalibou />

      <CtaOrder />
    </>
  );
}