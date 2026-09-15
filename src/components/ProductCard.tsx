import React from 'react';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../data/products';
import { imageOnError } from '../lib/imageFallback';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd,
}) => {
  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col rounded-2xl bg-white border border-[#2A140B]/8 overflow-hidden shadow-[0_4px_16px_rgba(42,20,11,0.03)] hover:shadow-[0_8px_24px_rgba(42,20,11,0.07)] hover:border-[#B87932]/30 transition-all duration-300 text-left"
    >
      {/* Product Image Stage */}
      <Link
        href={`/produk/${product.id}`}
        aria-label={`Lihat detail ${product.name}`}
        className="relative aspect-square w-full bg-[#F3ECE2] overflow-hidden cursor-pointer block"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={imageOnError}
          className="w-full h-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-103"
        />

        {/* Weight / Unit indicator */}
        {(product.unit || product.weight) && (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="px-1.5 py-0.5 rounded bg-white/90 text-[#5E3622] text-[10px] font-medium border border-[#2A140B]/10 backdrop-blur-xs">
              {product.unit || product.weight}
            </span>
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Category kicker */}
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] font-semibold text-[#B87932] mb-1 truncate block">
          {product.categoryName}
        </span>

        {/* Title */}
        <Link
          href={`/produk/${product.id}`}
          title={product.name}
          className="font-serif font-bold text-sm sm:text-base text-[#2A140B] group-hover:text-[#5E3622] cursor-pointer transition-colors line-clamp-1 mb-1 block"
        >
          {product.name}
        </Link>

        {/* Brief teaser */}
        <p className="text-xs text-[#5E3622]/80 line-clamp-1 mb-3">
          {product.description}
        </p>

        {/* Bottom Price & Action row: stacked on mobile, single row from sm */}
        <div className="mt-auto pt-2.5 border-t border-[#2A140B]/6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2">
          <div className="min-w-0 text-left">
            <span className="text-[10px] text-[#5E3622]/70 block leading-tight truncate">
              Harga{product.unit ? ` / ${product.unit}` : ''}
            </span>
            <span className="font-sans font-bold text-sm sm:text-base text-[#2A140B] block truncate">
              {formatRupiah(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => onSelect(product)}
              className="flex-1 sm:flex-initial min-h-[36px] sm:min-h-0 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE2] text-[#2A140B] text-xs font-semibold flex items-center justify-center gap-1 border border-[#2A140B]/8 transition-colors"
              title="Lihat rincian produk"
            >
              <span>Detail</span>
              <ArrowRight className="w-3 h-3 text-[#B87932]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product);
              }}
              aria-label={`Tambah ${product.name} ke keranjang`}
              className="w-9 h-9 rounded-lg bg-[#2A140B] hover:bg-[#3A1F14] text-white flex items-center justify-center transition-colors shadow-2xs flex-shrink-0"
              title="Tambah cepat ke keranjang pesanan"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
