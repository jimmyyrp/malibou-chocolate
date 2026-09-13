import React from 'react';
import { Layers, Sparkles, MapPin } from 'lucide-react';

export const WhyMalibou: React.FC = () => {
  const pillars = [
    {
      title: 'Pilihan Produk Lengkap',
      subtitle: 'Beragam olahan cokelat dan produk kakao murni.',
      desc: 'Mulai dari coklat batangan (70% hingga 100%), praline box hadiah, minuman coklat creamy 3in1, hingga bahan baku murni (cocoa powder, butter, dan biji kakao fermentasi).',
      icon: Layers,
    },
    {
      title: 'Chocolate Experience',
      subtitle: 'Cita rasa presisi untuk berbagai kebutuhan.',
      desc: 'Diformulasikan secara teliti untuk camilan santai keluarga, sajian kafe & restoran, bahan racikan bakery profesional, maupun bingkisan oleh-oleh khas Sumatera Barat.',
      icon: Sparkles,
    },
    {
      title: 'Local Terroir Minangkabau',
      subtitle: 'Mengangkat potensi kakao Padang Pariaman.',
      desc: 'Berakar dari perkebunan kakao subur di kawasan Malibou Anai, Sumatera Barat. Menjaga kemurnian aroma alami tanpa bahan kimia berlebih dan memberdayakan petani lokal.',
      icon: MapPin,
    },
  ];

  return (
    <section id="why-malibou" className="py-20 md:py-24 bg-[#F3ECE2] border-b border-[#2A140B]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B87932] block mb-2">
            WHY MALIBOU?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A140B] tracking-tight mb-3">
            Dedikasi Kakao Ranah Minang
          </h2>
          <p className="text-sm sm:text-base text-[#5E3622]">
            Standar pengolahan yang jujur, bahan baku lokal terpercaya, dan komitmen pada cita rasa autentik nusantara.
          </p>
        </div>

        {/* 3 Editorial Columns with subtle dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 divide-y md:divide-y-0 md:divide-x divide-[#2A140B]/8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={`flex flex-col text-left ${idx > 0 ? 'pt-8 md:pt-0 md:pl-8 lg:pl-10' : ''}`}
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-[#2A140B]/8 shadow-2xs flex items-center justify-center text-[#2A140B] mb-4">
                  <Icon className="w-5 h-5 text-[#B87932]" />
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2A140B] mb-1.5">
                  {pillar.title}
                </h3>

                <p className="text-xs font-semibold text-[#B87932] uppercase tracking-wider mb-3">
                  {pillar.subtitle}
                </p>

                <p className="text-sm text-[#5E3622] leading-relaxed font-normal">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
