'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageCircle,
  Plus,
  Minus,
  ShoppingBag,
  Package,
  ShieldCheck,
  Truck,
  ChevronRight,
} from 'lucide-react';
import { useProducts } from '../context/ProductsProvider';
import { useCart } from '../context/CartProvider';
import { ProductCard } from './ProductCard';
import { formatRupiah, OFFICIAL_WHATSAPP_NUMBER } from '../data/products';

interface ProductDetailPageProps {
  productParam: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productParam,
}) => {
  const { products, loaded } = useProducts();
  const { addToCart } = useCart();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);

  const rawParam = String(productParam ?? '').trim();
  const numericId = Number(rawParam);
  const numericValid = Number.isFinite(numericId) && numericId > 0;

  // Lookup: dukung id angka (katalog baru) dan kode produk lama (PRD019 / prd019)
  const product = useMemo(() => {
    if (numericValid) {
      return products.find((p) => p.id === numericId);
    }
    const code = rawParam.toUpperCase();
    return products.find((p) => p.code.toUpperCase() === code);
  }, [products, rawParam, numericValid, numericId]);

  // Normalisasi URL kode lama -> URL canonical id angka
  useEffect(() => {
    if (product && !numericValid) {
      router.replace(`/produk/${product.id}`);
    }
  }, [product, numericValid, router]);

  if (!loaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center text-sm text-[#5E3622]">
        Memuat detail produk…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B87932] mb-4">
          <Package className="w-4 h-4" />
          <span>Produk Tidak Ditemukan</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A140B] mb-3">
          Produk tidak ditemukan
        </h1>
        <p className="text-sm text-[#5E3622] max-w-md mx-auto mb-8">
          Produk yang Anda cari mungkin telah dihapus atau kode halaman tidak benar.
          Silakan lihat katalog lengkap Malibou untuk produk terbaru.
        </p>
        <button
          onClick={() => router.push('/katalog')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2A140B] hover:bg-[#3A1F14] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Katalog</span>
        </button>
      </div>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Halo Malibou Chocolate, saya ingin memesan:\n\n- ${product.name} (x${quantity})\n  Harga: ${formatRupiah(product.price * quantity)}\n\nMohon konfirmasi ketersediaan stok, ongkos kirim, dan nomor rekening pembayaran resmi Malibou. Terima kasih!`
    );
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#5E3622]/80 mb-6 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#B87932] transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3 h-3 text-[#B87932]" />
        <Link href="/katalog" className="hover:text-[#B87932] transition-colors">
          Katalog
        </Link>
        <ChevronRight className="w-3 h-3 text-[#B87932]" />
        <span className="text-[#2A140B] font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Product Image */}
        <div className="relative">
          <div className="lg:sticky lg:top-28">
            <div className="rounded-2xl bg-white p-2.5 sm:p-3 border border-[#2A140B]/8 shadow-[0_16px_36px_rgba(42,20,11,0.06)]">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F3ECE2]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.featured && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#2A140B]/85 text-[#FAF7F2] text-[10px] font-semibold tracking-wider uppercase">
                    Unggulan
                  </span>
                )}
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-white border border-[#2A140B]/8 text-center">
                <Truck className="w-4 h-4 text-[#B87932] mx-auto mb-1.5" />
                <span className="text-[10px] leading-tight text-[#5E3622] block font-medium">
                  Kirim ke Seluruh Indonesia
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#2A140B]/8 text-center">
                <ShieldCheck className="w-4 h-4 text-[#B87932] mx-auto mb-1.5" />
                <span className="text-[10px] leading-tight text-[#5E3622] block font-medium">
                  Kemasan Higienis & Aman
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#2A140B]/8 text-center">
                <Package className="w-4 h-4 text-[#B87932] mx-auto mb-1.5" />
                <span className="text-[10px] leading-tight text-[#5E3622] block font-medium">
                  Produk Asli Malibou
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="text-left">
          <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#B87932] block mb-2">
            {product.categoryName}
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-[#2A140B] leading-[1.12] mb-3">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#5E3622]/80 mb-5">
            {product.code && (
              <span className="inline-flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>Kode {product.code}</span>
              </span>
            )}
            {(product.unit || product.weight) && (
              <span className="inline-flex items-center gap-1">
                <span>
                  Kemasan {product.weight ? product.weight : product.unit}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2.5 mb-6">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#2A140B]">
              {formatRupiah(product.price)}
            </span>
            {product.unit && (
              <span className="text-xs text-[#5E3622]/70">/ {product.unit}</span>
            )}
          </div>

          <p className="text-sm sm:text-base text-[#5E3622] leading-relaxed mb-7">
            {product.description}
          </p>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-wrap items-center gap-3.5 mb-7">
            <div className="flex items-center gap-2.5 bg-white border border-[#2A140B]/12 rounded-full px-3 py-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#2A140B]/12 flex items-center justify-center text-[#2A140B] hover:bg-[#F3ECE2] transition-colors"
                aria-label="Kurangi jumlah"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold text-[#2A140B] w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-full bg-[#2A140B] text-white flex items-center justify-center hover:bg-[#3A1F14] transition-colors"
                aria-label="Tambah jumlah"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => addToCart(product, quantity)}
              className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#2A140B] hover:bg-[#3A1F14] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase transition-all shadow-xs active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 text-[#C58B47]" />
              <span>Tambah ke Keranjang</span>
            </button>
          </div>

          <button
            onClick={handleWhatsApp}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#F3ECE2] text-[#2A140B] border border-[#2A140B]/12 text-xs font-semibold tracking-wider uppercase transition-all"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Pesan Langsung via WhatsApp</span>
          </button>

          {/* Editorial note */}
          <div className="mt-7 p-4 rounded-xl bg-[#F3ECE2]/80 border border-[#2A140B]/8">
            <p className="text-xs text-[#5E3622] leading-relaxed">
              Setiap produk Malibou diolah dari <strong>bahan pilihan Ranah Minang</strong>,
              dikemas higienis, dan dikirim langsung dari Padang Pariaman, Sumatera Barat.
              Hubungi kami untuk pemesanan dalam jumlah besar (buletin/industri).
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4 mb-6 pb-5 border-b border-[#2A140B]/8">
            <div className="text-left">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B87932] block mb-1">
                Produk Serupa
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A140B] tracking-tight">
                {product.categoryName} Lainnya
              </h2>
            </div>
            <button
              onClick={() => router.push(`/katalog?kategori=${product.category}`)}
              className="text-xs font-semibold text-[#B87932] hover:text-[#2A140B] transition-colors flex-shrink-0"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(prod) => router.push(`/produk/${prod.id}`)}
                onQuickAdd={(prod) => addToCart(prod, 1)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};