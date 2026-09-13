import React from 'react';
import { MessageCircle } from 'lucide-react';
import { OFFICIAL_WHATSAPP_NUMBER } from '../data/products';

export const CtaOrder: React.FC = () => {
  const handleDirectWhatsApp = () => {
    const message = encodeURIComponent(
      'Halo Malibou Chocolate, saya ingin memesan produk cokelat dan produk kakao Malibou.'
    );
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <section id="cta-order" className="py-20 md:py-24 bg-[#241209] text-[#FAF7F2] relative text-center border-t border-[#3A1F14]">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-10 h-0.5 bg-[#C58B47] mx-auto mb-6" />
        
        {/* Strictly matching prompt wording */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3 uppercase">
          SUDAH MENEMUKAN<br />FAVORITMU?
        </h2>

        <p className="text-base sm:text-lg text-[#FAF7F2]/80 mb-8 max-w-md mx-auto font-normal">
          Pesan produk Malibou sekarang.
        </p>

        <button
          onClick={handleDirectWhatsApp}
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#B87932] hover:bg-[#C58B47] text-white font-semibold text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all active:scale-98"
        >
          <MessageCircle className="w-4 h-4 text-white" />
          <span>Pesan via WhatsApp</span>
        </button>

        <p className="text-xs text-[#EAE2D5]/60 mt-5">
          Layanan Pelanggan & Pemesanan Resmi • Respon Cepat Setiap Hari
        </p>
      </div>
    </section>
  );
};
