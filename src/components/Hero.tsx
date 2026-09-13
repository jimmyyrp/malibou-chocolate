import React from 'react';
import { ArrowDown, MessageCircle, ArrowRight } from 'lucide-react';
import { MalibouLogo } from './MalibouLogo';
import { OFFICIAL_WHATSAPP_NUMBER } from '../data/products';

interface HeroProps {
  onExploreProducts: () => void;
  onOpenOrderModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreProducts }) => {
  const handleDirectWhatsApp = () => {
    const message = encodeURIComponent(
      'Halo Malibou Chocolate, saya tertarik untuk mengetahui katalog dan memesan produk cokelat & kakao Malibou.'
    );
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-[#2A140B]/8 bg-[#FAF7F2]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Brand Story & Call to Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
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
                onClick={handleDirectWhatsApp}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-[#F3ECE2] text-[#2A140B] border border-[#2A140B]/12 text-sm font-medium tracking-wide transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
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

          {/* Right Column: Refined Editorial Visual Showcase */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Image Matting */}
              <div className="relative rounded-2xl bg-white p-2.5 sm:p-3 shadow-[0_16px_36px_rgba(42,20,11,0.06)] border border-[#2A140B]/8">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#F3ECE2]">
                  <img
                    src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1000&q=85"
                    alt="Malibou Chocolate Display"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
                  />
                  
                  {/* Subtle lower vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A140B]/60 via-transparent to-transparent" />

                  {/* Clean bottom caption */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-[#FAF7F2]/95 backdrop-blur-xs border border-white/70 flex items-center justify-between text-left shadow-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#B87932] block">
                        Signature Line
                      </span>
                      <span className="font-serif font-bold text-sm text-[#2A140B] block">
                        Coklat Batangan 70% – 100%
                      </span>
                    </div>
                    <button
                      onClick={onExploreProducts}
                      className="text-xs font-semibold text-[#B87932] hover:text-[#2A140B] flex items-center gap-0.5"
                    >
                      <span>Detail</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
