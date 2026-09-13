import React from 'react';
import { ArrowDown, ShoppingBag } from 'lucide-react';
import { MalibouLogo } from './MalibouLogo';

interface HeroProps {
  onExploreProducts: () => void;
  onOpenOrderModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreProducts, onOpenOrderModal }) => {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-[#2A140B]/8 bg-[#FAF7F2]"
    >
      {/* Overlay gambar latar hero.png */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.png"
          alt=""
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.7] saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/85 via-[#FAF7F2]/40 to-[#FAF7F2]/5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl flex flex-col items-start text-left">

          {/* Origin Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3ECE2] text-[#5E3622] text-[11px] font-semibold tracking-[0.16em] uppercase mb-5 border border-[#2A140B]/6">
            <span>Ranah Minang</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C58B47]" />
            <span>Modern Cocoa House</span>
          </div>

          {/* Emblem Mark */}
          <div className="mb-3">
            <MalibouLogo size="lg" />
          </div>

          {/* Main Display Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2A140B] tracking-tight leading-[1.08] mb-3">
            COKELAT MALIBOU
          </h1>

          {/* Signature Tagline */}
          <p className="font-serif text-2xl sm:text-3xl italic text-[#5E3622] mb-5 font-normal">
            From Cocoa to Chocolate
          </p>

          {/* Narrative Body */}
          <p className="text-base sm:text-lg text-[#2A140B]/85 max-w-xl font-normal leading-relaxed mb-8">
            Temukan aneka olahan cokelat dan produk kakao murni Malibou.
            Menghadirkan keaslian cita rasa kakao Ranah Minang dari perkebunan pilihan di Padang Pariaman hingga siap dinikmati di meja Anda.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto mb-8">
            <button
              id="hero-btn-explore"
              onClick={onExploreProducts}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#2A140B] hover:bg-[#3A1F14] text-[#FAF7F2] text-sm font-medium tracking-wide shadow-xs hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-2.5"
            >
              <span>Lihat Produk</span>
              <ArrowDown className="w-4 h-4 text-[#C58B47]" />
            </button>

            <button
              id="hero-btn-order"
              onClick={onOpenOrderModal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-[#F3ECE2] text-[#2A140B] border border-[#2A140B]/12 text-sm font-medium tracking-wide transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#B87932]" />
              <span>Pesan Sekarang</span>
            </button>
          </div>

          {/* Editorial Terroir Strip */}
          <div className="pt-6 border-t border-[#2A140B]/8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#5E3622]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C58B47]" />
              Biji Kakao Pilihan Sumatera Barat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C58B47]" />
              Fermentasi & Pengolahan Alami
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C58B47]" />
              Koleksi Cokelat & Rendang Spesial
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};