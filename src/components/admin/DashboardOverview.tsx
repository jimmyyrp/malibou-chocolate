'use client';

import React, { useMemo } from 'react';
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  LayoutGrid,
  Package,
  PackagePlus,
  Star,
  Tags,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Product } from '../../types';
import { CATEGORIES, formatRupiah } from '../../data/products';
import { imageOnError } from '../../lib/imageFallback';

interface DashboardOverviewProps {
  products: Product[];
  adminUser: string;
  onManageProducts: () => void;
  onAddProduct: () => void;
}

interface PriceBucket {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

const PRICE_BUCKETS: PriceBucket[] = [
  { id: 'under-25', label: 'Di bawah Rp 25.000', min: 0, max: 24999 },
  { id: '25-50', label: 'Rp 25.000 – Rp 50.000', min: 25000, max: 49999 },
  { id: '50-100', label: 'Rp 50.000 – Rp 100.000', min: 50000, max: 99999 },
  { id: 'over-100', label: 'Rp 100.000 ke atas', min: 100000, max: null },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  adminUser,
  onManageProducts,
  onAddProduct,
}) => {
  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    []
  );

  const stats = useMemo(() => {
    const filledCategories = new Set(products.map((p) => p.category)).size;
    const featured = products.filter((p) => p.featured).length;
    const totalValue = products.reduce((s, p) => s + p.price, 0);
    return { total: products.length, filledCategories, featured, totalValue };
  }, [products]);

  const categoryData = useMemo(() => {
    return CATEGORIES.map((c) => {
      const count = products.filter((p) => p.category === c.id).length;
      const share = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
      return { ...c, count, share };
    }).sort((a, b) => b.count - a.count);
  }, [products, stats.total]);

  const featuredProducts = useMemo(
    () => products.filter((p) => p.featured),
    [products]
  );

  const bucketData = useMemo(() => {
    return PRICE_BUCKETS.map((b) => {
      const count = products.filter(
        (p) => p.price >= b.min && (b.max === null || p.price <= b.max)
      ).length;
      const share = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
      return { ...b, count, share };
    });
  }, [products, stats.total]);

  const cheapest = useMemo(
    () =>
      products.length > 0
        ? products.reduce((a, b) => (b.price < a.price ? b : a))
        : null,
    [products]
  );

  const mostExpensive = useMemo(
    () =>
      products.length > 0
        ? products.reduce((a, b) => (b.price > a.price ? b : a))
        : null,
    [products]
  );

  return (
    <div className="space-y-6">
      {/* Greeting + Quick Actions */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE2] text-[#5E3622] text-[10px] font-semibold tracking-[0.18em] uppercase border border-[#2A140B]/6 mb-3">
            <TrendingUp className="w-3 h-3 text-[#B87932]" />
            Ringkasan Toko
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A140B] tracking-tight leading-tight">
            Selamat datang kembali, {adminUser || 'Admin'}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#5E3622]/70 inline-flex flex-wrap items-center gap-x-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-[#B87932]" />
            {dateLabel}
            <span className="text-[#5E3622]/35">•</span>
            {stats.total} produk terdaftar di katalog
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onManageProducts}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#5E3622] bg-white border border-[#2A140B]/10 hover:bg-[#F3ECE2] transition-colors"
          >
            <LayoutGrid className="w-4 h-4 text-[#B87932]" />
            Kelola Produk
          </button>
          <button
            onClick={onAddProduct}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#2A140B] hover:bg-[#3A1F14] shadow-xs transition-colors active:scale-[0.98]"
          >
            <PackagePlus className="w-4 h-4 text-[#C58B47]" />
            Tambah Produk
          </button>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <OverviewCard
          icon={<Package className="w-4 h-4" />}
          label="Total Produk"
          value={String(stats.total)}
          hint="Produk aktif"
        />
        <OverviewCard
          icon={<Tags className="w-4 h-4" />}
          label="Kategori Terisi"
          value={String(stats.filledCategories)}
          hint={`dari ${CATEGORIES.length} kategori`}
        />
        <OverviewCard
          icon={<Star className="w-4 h-4" />}
          label="Produk Unggulan"
          value={String(stats.featured)}
          hint={
            stats.featured > 0
              ? `${Math.round((stats.featured / stats.total) * 100)}% dari produk`
              : 'Belum ada'
          }
        />
        <OverviewCard
          icon={<Banknote className="w-4 h-4" />}
          label="Nilai Katalog"
          value={formatRupiah(stats.totalValue)}
          hint="Total harga seluruh produk"
        />
      </section>

      {/* Category Summary + Featured */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#2A140B]/10 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A140B]">
                Ringkasan Kategori
              </h2>
              <p className="text-xs text-[#5E3622]/70 mt-0.5">
                Sebaran produk di tiap kategori katalog
              </p>
            </div>
            <button
              onClick={onManageProducts}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#B87932] hover:text-[#2A140B] transition-colors"
            >
              Lihat Produk
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {categoryData.map((c) => (
              <div key={c.id} className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F3ECE2] flex items-center justify-center text-base flex-shrink-0">
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-[#2A140B] truncate">
                      {c.name}
                    </span>
                    <span className="text-xs text-[#5E3622]/70 flex-shrink-0 whitespace-nowrap">
                      <strong className="text-[#2A140B]">{c.count}</strong>{' '}
                      produk · {c.share}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F3ECE2] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#B87932]/80 transition-all"
                      style={{ width: `${Math.max(c.share, c.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#2A140B]/10 shadow-xs p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A140B]">
                Produk Unggulan
              </h2>
              <p className="text-xs text-[#5E3622]/70 mt-0.5">
                Ditandai bintang di katalog utama
              </p>
            </div>
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#B87932]/10 text-[#B87932] flex-shrink-0">
              <Star className="w-4 h-4 fill-current" />
            </span>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="flex-1 space-y-3">
              {featuredProducts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#F3ECE2] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.name} onError={imageOnError} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#2A140B] truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-[#5E3622]/70 truncate">{p.categoryName}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#2A140B] whitespace-nowrap">
                    {formatRupiah(p.price)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="w-11 h-11 rounded-full bg-[#F3ECE2] text-[#5E3622]/50 flex items-center justify-center mb-2.5">
                <Star className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#2A140B] mb-1">
                Belum ada produk unggulan
              </p>
              <p className="text-[11px] text-[#5E3622]/70">
                Tandai produk favorit Anda pada halaman produk.
              </p>
            </div>
          )}

          <button
            onClick={onManageProducts}
            className="mt-4 w-full inline-flex items-center justify-center gap-1.5 min-h-[38px] rounded-xl text-xs font-semibold text-[#5E3622] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors"
          >
            Kelola Unggulan
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Price Distribution + Range */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-[#2A140B]/10 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A140B]">
                Distribusi Harga
              </h2>
              <p className="text-xs text-[#5E3622]/70 mt-0.5">
                Rentang harga seluruh produk di katalog
              </p>
            </div>
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#B87932]/10 text-[#B87932] flex-shrink-0">
              <Wallet className="w-4 h-4" />
            </span>
          </div>

          {products.length > 0 ? (
            <div className="space-y-4">
              {bucketData.map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs sm:text-sm font-medium text-[#5E3622]">
                      {b.label}
                    </span>
                    <span className="text-xs text-[#5E3622]/70 whitespace-nowrap">
                      <strong className="text-[#2A140B]">{b.count}</strong>{' '}
                      produk
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F3ECE2] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2A140B]/70 transition-all"
                      style={{ width: `${Math.max(b.share, b.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5E3622]/70 py-8 text-center">
              Belum ada produk untuk dihitung.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#2A140B]/10 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A140B]">
                Rentang Harga Katalog
              </h2>
              <p className="text-xs text-[#5E3622]/70 mt-0.5">
                Produk termurah dan termahal saat ini
              </p>
            </div>
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#B87932]/10 text-[#B87932] flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>

          {cheapest && mostExpensive ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PriceRangeCard
                title="Termurah"
                product={cheapest}
                highlighted={cheapest.id === mostExpensive.id}
              />
              <PriceRangeCard
                title="Termahal"
                product={mostExpensive}
                highlighted={cheapest.id === mostExpensive.id}
              />
            </div>
          ) : (
            <p className="text-xs text-[#5E3622]/70 py-8 text-center">
              Belum ada produk di katalog.
            </p>
          )}
        </div>
      </section>

      {/* Quick Link */}
      <section className="rounded-2xl bg-[#2A140B] text-[#FAF7F2] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#B87932]/20 text-[#C58B47] flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-base sm:text-lg font-bold">
                Kelola katalog produk
              </p>
              <p className="text-xs text-[#EAE2D5]/80">
                Perbarui, tambahkan, atau hapus produk kapan saja.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onAddProduct}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-[#2A140B] bg-[#C58B47] hover:bg-[#D99B5B] transition-colors"
            >
              <PackagePlus className="w-4 h-4" />
              Tambah Produk
            </button>
            <button
              onClick={onManageProducts}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-[#FAF7F2] border border-[#FAF7F2]/25 hover:bg-[#FAF7F2]/10 transition-colors"
            >
              Buka Kelola
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const OverviewCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}> = ({ icon, label, value, hint }) => (
  <div className="bg-white rounded-2xl border border-[#2A140B]/10 p-4 sm:p-5 shadow-xs">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#F3ECE2] text-[#B87932] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5E3622]/70 truncate">
          {label}
        </p>
        <p className="font-serif font-bold text-lg sm:text-xl text-[#2A140B] truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
    <p className="mt-2.5 pt-2.5 border-t border-[#2A140B]/6 text-[11px] text-[#5E3622]/70 truncate">
      {hint}
    </p>
  </div>
);

const PriceRangeCard: React.FC<{
  title: string;
  product: Product;
  highlighted: boolean;
}> = ({ title, product, highlighted }) => (
  <div className="rounded-xl border border-[#2A140B]/8 bg-[#FAF7F2] p-3.5">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#B87932] mb-2">
      {title}
      {highlighted && <span className="ml-1.5 normal-case text-[#5E3622]/60">(sama)</span>}
    </p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F3ECE2] flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={product.name} onError={imageOnError} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#2A140B] truncate leading-snug">
          {product.name}
        </p>
        <p className="text-[11px] text-[#5E3622]/70 truncate">{product.categoryName}</p>
        <p className="font-serif font-bold text-sm text-[#2A140B] mt-0.5">
          {formatRupiah(product.price)}
        </p>
      </div>
    </div>
  </div>
);