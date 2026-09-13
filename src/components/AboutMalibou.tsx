import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { MalibouLogo } from './MalibouLogo';

export const AboutMalibou: React.FC = () => {
  const [showStoryModal, setShowStoryModal] = useState(false);

  return (
    <section id="about" className="py-20 md:py-28 bg-[#FAF7F2] border-b border-[#2A140B]/8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Photo Presentation */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden bg-white p-2.5 sm:p-3 shadow-[0_16px_36px_rgba(42,20,11,0.06)] border border-[#2A140B]/8">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F3ECE2]">
                <img
                  src="https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=1000&q=80"
                  alt="Perkebunan Kakao Malibou Sumatera Barat"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A140B]/75 via-transparent to-transparent" />
                
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-left text-white">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-[#C58B47] block mb-0.5">
                    Padang Pariaman • Sumatera Barat
                  </span>
                  <span className="font-serif text-base sm:text-lg font-bold block text-[#FAF7F2]">
                    Sentra Perkebunan & Pengolahan Biji Kakao
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Concise Story matching prompt */}
          <div className="lg:col-span-6 order-1 lg:order-2 text-left">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B87932] block mb-2">
              ABOUT MALIBOU
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A140B] tracking-tight mb-4">
              Mengenal Malibou
            </h2>

            <p className="text-base sm:text-lg text-[#5E3622] leading-relaxed mb-4 font-normal">
              Malibou Chocolate menghadirkan berbagai olahan cokelat dan produk berbasis kakao dalam beragam pilihan.
            </p>

            <p className="text-sm sm:text-base text-[#2A140B]/80 leading-relaxed mb-8 font-normal">
              Terinspirasi dari kekayaan alam Ranah Minang, Malibou berdedikasi menjaga kualitas pengolahan biji kakao lokal dengan standar mutu yang jujur. Kami memadukan kearifan tradisi pascapanen dan pengolahan modern agar cita rasa kakao asli dapat dinikmati di seluruh Indonesia.
            </p>

            <button
              onClick={() => setShowStoryModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2A140B] hover:bg-[#3A1F14] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase transition-all shadow-xs active:scale-98"
            >
              <span>Kenali Malibou</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C58B47]" />
            </button>
          </div>

        </div>
      </div>

      {/* Story Modal */}
      {showStoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A140B]/65 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowStoryModal(false)}
        >
          <div
            className="relative w-full max-w-xl bg-[#FAF7F2] rounded-2xl p-6 sm:p-8 border border-[#2A140B]/10 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowStoryModal(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center absolute top-3 right-3 rounded-full hover:bg-[#F3ECE2] text-[#2A140B] transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <MalibouLogo size="sm" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A140B] mb-3">
              Kisah dari Ranah Minang
            </h3>

            <div className="space-y-3.5 text-sm text-[#2A140B]/85 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                Kawasan Malibou Anai di Kabupaten Padang Pariaman, Sumatera Barat telah lama dikenal sebagai jalur perlintasan alam yang asri dengan potensi perkebunan kakao yang subur.
              </p>
              <p>
                <strong>Malibou Chocolate</strong> hadir dengan tekad mentransformasi komoditas biji kakao mentah lokal menjadi produk bernilai tambah tinggi: mulai dari cokelat batangan murni (70%, 80%, hingga 100%), kreasi rasa inovatif seperti Coklat Balado, minuman cokelat 3in1 creamy, hingga produk kuliner khas Ranah Minang seperti Rendang Coklat.
              </p>
              <p>
                Dengan konsep <em>"Modern Cocoa House"</em>, kami berkomitmen menyajikan transparansi mutu, ketersediaan bahan baku murni (cocoa butter dan cocoa powder) untuk berbagai industri kuliner, serta kemudahan pemesanan langsung bagi setiap pecinta cokelat di nusantara.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#2A140B]/8 flex items-center justify-between">
              <span className="text-xs text-[#5E3622] font-medium">
                Padang Pariaman, Sumatera Barat • Indonesia
              </span>
              <button
                onClick={() => setShowStoryModal(false)}
                className="px-5 py-2 rounded-full bg-[#2A140B] text-white text-xs font-semibold hover:bg-[#3A1F14] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
