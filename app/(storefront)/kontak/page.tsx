'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Send,
  ChevronRight,
  PackageSearch,
} from 'lucide-react';
import { OFFICIAL_WHATSAPP_NUMBER } from '../../../src/data/products';
import { useCart } from '../../../src/context/CartProvider';

const orderSteps = [
  {
    title: 'Pilih Produk',
    desc: 'Cek katalog dan tambahkan produk ke keranjang pesanan.',
  },
  {
    title: 'Isi Detail Pemesan',
    desc: 'Lengkapi nama, alamat pengiriman, dan catatan khusus.',
  },
  {
    title: 'Konfirmasi via WhatsApp',
    desc: 'Pesanan terkirim otomatis ke WhatsApp resmi Malibou.',
  },
  {
    title: 'Pembayaran & Pengiriman',
    desc: 'Admin mengonfirmasi stok, ongkir, lalu pesanan dikirim.',
  },
];

export default function KontakPage() {
  const { cartCount, openCart } = useCart();

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      'Halo Malibou Chocolate, saya ingin bertanya seputar produk, stok, dan pemesanan.'
    );
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Page Header Band */}
      <section className="bg-[#FAF7F2] border-b border-[#2A140B]/8 pt-24 sm:pt-28 md:pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B87932] block mb-2">
            CONTACT US
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A140B] tracking-tight mb-3">
            Hubungi Malibou
          </h1>
          <p className="text-sm sm:text-base text-[#5E3622] max-w-2xl leading-relaxed">
            Konsultasi produk, tanya stok, pemesanan partai besar, atau sekadar menyapa — tim
            Malibou siap membantu Anda.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left: Kontak */}
          <div className="lg:col-span-5 space-y-4 text-left">
            {/* Alamat */}
            <div className="p-5 rounded-2xl bg-white border border-[#2A140B]/8 shadow-xs flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F3ECE2] text-[#B87932] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#2A140B] mb-1">
                  Alamat Produksi & Gallery
                </h3>
                <p className="text-xs text-[#5E3622] leading-relaxed">
                  Kawasan Malibou Anai, Padang Pariaman, Sumatera Barat, Indonesia
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="p-5 rounded-2xl bg-white border border-[#2A140B]/8 shadow-xs flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#E7F5EC] text-[#25D366] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#2A140B] mb-1">
                  WhatsApp Resmi
                </h3>
                <p className="text-xs text-[#5E3622] leading-relaxed mb-2">
                  0822-8356-9177 — respon tercepat untuk pemesanan dan pemesanan stok.
                </p>
                <a
                  href={`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:text-[#1EBE5D] transition-colors"
                >
                  <span>Buka WhatsApp</span>
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Jam Layanan */}
            <div className="p-5 rounded-2xl bg-white border border-[#2A140B]/8 shadow-xs flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F3ECE2] text-[#B87932] flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#2A140B] mb-1">
                  Jam Layanan
                </h3>
                <p className="text-xs text-[#5E3622] leading-relaxed">
                  Senin – Minggu, 08:00 – 21:00 WIB
                </p>
              </div>
            </div>

            {/* Telepon */}
            <div className="p-5 rounded-2xl bg-white border border-[#2A140B]/8 shadow-xs flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F3ECE2] text-[#B87932] flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#2A140B] mb-1">
                  Telepon / Call Center
                </h3>
                <p className="text-xs text-[#5E3622] leading-relaxed">
                  0822-8356-9177 (sama dengan WhatsApp)
                </p>
              </div>
            </div>

            {/* CTA Keranjang */}
            <div className="p-5 rounded-2xl bg-[#2A140B] text-[#FAF7F2] border border-[#3A1F14] shadow-xs">
              <h3 className="font-serif font-bold text-sm mb-1.5">
                Sudah memilih produk?
              </h3>
              <p className="text-xs text-[#EAE2D5]/80 leading-relaxed mb-3">
                {cartCount > 0
                  ? `Anda memiliki ${cartCount} item di daftar pesanan.`
                  : 'Tambah produk ke keranjang lalu kirim pesanan langsung ke WhatsApp kami.'}
              </p>
              <button
                onClick={() => openCart()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#C58B47] hover:bg-[#B87932] text-[#1C0D06] text-xs font-semibold transition-all active:scale-98"
              >
                <span>Buka Keranjang Pesanan</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Right: Cara Memesan */}
          <div className="lg:col-span-7 text-left">
            <div className="mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B87932] block mb-2">
                Cara Memesan
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A140B] tracking-tight">
                Empat Langkah Mudah
              </h2>
            </div>

            <div className="space-y-3">
              {orderSteps.map((step, i) => (
                <div
                  key={step.title}
                  className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#2A140B]/8 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-full bg-[#2A140B] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-serif font-bold text-sm text-[#2A140B] mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#5E3622] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 p-5 rounded-2xl bg-[#F3ECE2]/80 border border-[#2A140B]/8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <PackageSearch className="w-5 h-5 text-[#B87932] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#5E3622] leading-relaxed">
                    Ingin pemesanan dalam jumlah besar untuk toko, cafe, bakery, atau oleh-oleh?
                    Lanjutkan dengan menelusuri katalog lalu pilih kemasan bulk.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 sm:flex-shrink-0">
                  <Link
                    href="/katalog"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-[#2A140B]/12 text-[#2A140B] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors"
                  >
                    <span>Lihat Katalog</span>
                  </Link>
                  <button
                    onClick={handleWhatsApp}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Pesan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}