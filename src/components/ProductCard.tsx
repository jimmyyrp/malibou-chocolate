import React from 'react';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../data/products';

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
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
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

        {/* Bottom Price & Action row */}
        <div className="mt-auto pt-2.5 border-t border-[#2A140B]/6 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-[#5E3622]/70 block leading-tight">
              Harga{product.unit ? ` / ${product.unit}` : ''}
            </span>
            <span className="font-sans font-bold text-sm sm:text-base text-[#2A140B]">
              {formatRupiah(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(product)}
              className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE2] text-[#2A140B] text-xs font-semibold flex items-center gap-1 border border-[#2A140B]/8 transition-colors"
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
              className="w-8 h-8 rounded-lg bg-[#2A140B] hover:bg-[#3A1F14] text-white flex items-center justify-center transition-colors shadow-2xs"
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
