'use client';

import React from 'react';
import { MapPin, Phone, ArrowUp, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MalibouLogo } from './MalibouLogo';
import { OFFICIAL_WHATSAPP_NUMBER } from '../data/products';

export const Footer: React.FC = () => {
  const router = useRouter();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToCatalog = (category?: string) => {
    router.push(category ? `/katalog?kategori=${category}` : '/katalog');
  };

  return (
    <footer id="contact" className="bg-[#1C0D06] text-[#FAF7F2] pt-16 pb-12 border-t border-[#2A140B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#2A140B]">
          
          {/* Brand Info */}
          <div className="md:col-span-5 text-left">
            <div className="mb-4">
              <MalibouLogo size="md" variant="light-text" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#C58B47] font-semibold mb-3">
              Chocolate & Cocoa Products
            </p>
            <p className="text-xs sm:text-sm text-[#EAE2D5]/75 max-w-sm leading-relaxed mb-5 font-normal">
              Modern Cocoa House dari Ranah Minang. Menghadirkan aneka olahan cokelat, bubuk kakao murni, cocoa butter, serta varian spesial kuliner tradisional.
            </p>
            <div className="flex items-start gap-2.5 text-xs text-[#EAE2D5]/70 max-w-sm">
              <MapPin className="w-4 h-4 text-[#C58B47] flex-shrink-0 mt-0.5" />
              <span>Kawasan Malibou Anai, Padang Pariaman, Sumatera Barat, Indonesia</span>
            </div>
          </div>

          {/* Produk Column strictly matching prompt list */}
          <div className="md:col-span-4 text-left">
            <h4 className="font-serif font-bold text-base text-[#FAF7F2] mb-4">
              Pilihan Produk
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#EAE2D5]/75 font-normal">
              <li>
                <button
                  onClick={() => goToCatalog('chocolate-bar')}
                  className="hover:text-[#C58B47] transition-colors"
                >
                  Coklat Batangan (70%, 80%, 100% & Balado)
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToCatalog('praline-snack')}
                  className="hover:text-[#C58B47] transition-colors"
                >
                  Paralin (Pouch, Kotak & Botol)
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToCatalog('chocolate-drink')}
                  className="hover:text-[#C58B47] transition-colors"
                >
                  Minuman Coklat (3in1 & Sachet)
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToCatalog('cocoa-ingredients')}
                  className="hover:text-[#C58B47] transition-colors"
                >
                  Cocoa (Powder, Biji & Butter)
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToCatalog('ball-choco')}
                  className="hover:text-[#C58B47] transition-colors"
                >
                  Ball Choco (Renyah Isi Lembut)
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToCatalog('rendang')}
                  className="hover:text-[#C58B47] transition-colors"
                >
                  Rendang (Daging, Paru, Nangka & Bumbung)
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation & Contact */}
          <div className="md:col-span-3 text-left">
            <h4 className="font-serif font-bold text-base text-[#FAF7F2] mb-4">
              Layanan & Pemesanan
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#EAE2D5]/75 font-normal mb-5">
              <li>
                <button
                  onClick={() => router.push('/tentang')}
                  className="hover:text-[#C58B47] transition-colors"
                >
                  Tentang Malibou
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToCatalog('cocoa-ingredients')}
                  className="hover:text-[#C58B47] transition-colors"
                >
                  Bahan Baku Kakao Murni
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C58B47] transition-colors inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C58B47]" />
                  <span>WhatsApp Resmi Malibou</span>
                </a>
              </li>
            <li>
                <Link
                  href="/admin"
                  className="hover:text-[#C58B47] transition-colors inline-flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#C58B47]" />
                  <span>Dashboard Katalog (Admin)</span>
                </Link>
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-[#241209] border border-[#3A1F14] text-xs text-[#EAE2D5]/80">
              <span className="font-semibold text-[#C58B47] block mb-0.5">Customer Support:</span>
              <span>Senin – Minggu (08:00 – 21:00 WIB)</span>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#EAE2D5]/60 gap-4">
          <p>© 2026 Malibou Chocolate. All Rights Reserved. Padang Pariaman, Sumatera Barat.</p>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[#C58B47] hover:text-white transition-colors"
          >
            <span>Kembali ke Atas</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};