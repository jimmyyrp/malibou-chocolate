import React, { useEffect } from 'react';
import {
  X,
  ShoppingBag,
  MessageCircle,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { MalibouLogo } from './MalibouLogo';
import { ProductCategory } from '../types';
import { OFFICIAL_WHATSAPP_NUMBER } from '../data/products';

export interface NavItem {
  label: string;
  id: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onSelectCategory?: (category: ProductCategory) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  navItems,
  activeSection,
  onNavigate,
  onSelectCategory,
  cartCount,
  onOpenCart,
}) => {
  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDirectWhatsApp = () => {
    const message = encodeURIComponent(
      'Halo Malibou Chocolate, saya ingin mengetahui informasi stok dan memesan produk cokelat & kakao.'
    );
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${message}`, '_blank');
    onClose();
  };

  const quickCategories: { id: ProductCategory; name: string }[] = [
    { id: 'chocolate-bar', name: 'Coklat Batangan' },
    { id: 'praline-snack', name: 'Paralin' },
    { id: 'chocolate-drink', name: 'Minuman Coklat' },
    { id: 'cocoa-ingredients', name: 'Cocoa' },
    { id: 'ball-choco', name: 'Ball Choco' },
    { id: 'rendang', name: 'Rendang' },
  ];

  return (
    <div
      id="mobile-navigation-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Menu Navigasi Mobile"
      className="fixed inset-0 z-50 flex justify-end bg-[#2A140B]/60 backdrop-blur-xs transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs sm:max-w-sm bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between border-l border-[#2A140B]/12 overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A140B]/8 flex items-center justify-between bg-white/90 sticky top-0 z-10 backdrop-blur-sm">
          <button
            onClick={() => {
              onNavigate('hero');
              onClose();
            }}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B87932] rounded-lg text-left"
            aria-label="Kembali ke Beranda"
          >
            <MalibouLogo size="sm" hideSubOnMobile={false} />
          </button>

          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-[#F3ECE2] text-[#2A140B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B87932]"
            aria-label="Tutup Menu Navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 sm:p-5 space-y-6 flex-1">
          
          {/* Quick Cart Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#2A140B]/8 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2A140B] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-[#2A140B] block">Keranjang Pesanan</span>
                <span className="text-[11px] text-[#5E3622]">
                  {cartCount > 0 ? `${cartCount} item dipilih` : 'Keranjang kosong'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="min-h-[40px] px-3 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE2] text-xs font-semibold text-[#2A140B] border border-[#2A140B]/8 transition-colors flex items-center gap-1"
            >
              <span>Buka</span>
              <ArrowRight className="w-3 h-3 text-[#B87932]" />
            </button>
          </div>

          {/* Quick Category Jump Pills */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.16em] text-[#B87932] block mb-2 text-left">
              Pintas Kategori
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory(cat.id);
                    }
                    onNavigate('catalog');
                    onClose();
                  }}
                  className="min-h-[36px] px-2.5 py-1 rounded-full text-xs font-medium bg-white hover:bg-[#F3ECE2] text-[#2A140B] border border-[#2A140B]/10 transition-colors active:scale-95"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Navigation Links */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.16em] text-[#B87932] block mb-2 text-left">
              Menu Navigasi
            </span>
            <nav className="space-y-1" aria-label="Menu Seluler">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-[#2A140B] text-[#FAF7F2] font-semibold'
                        : 'text-[#5E3622] hover:bg-[#F3ECE2] hover:text-[#2A140B]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#C58B47]' : 'text-[#B87932]'}`} />
                      <span>{item.label}</span>
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C58B47]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Direct WhatsApp Callout Card */}
          <div className="p-4 rounded-2xl bg-[#241209] text-white text-left shadow-xs border border-[#3A1F14]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C58B47] block mb-1">
              Layanan Cepat
            </span>
            <h4 className="font-serif font-bold text-base text-[#FAF7F2] mb-1.5">
              Pesan Langsung ke WhatsApp
            </h4>
            <p className="text-xs text-[#EAE2D5]/80 leading-relaxed mb-3 font-normal">
              Konsultasi ketersediaan stok, pengiriman ke luar kota, maupun pemesanan khusus.
            </p>
            <button
              onClick={handleDirectWhatsApp}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold tracking-wide transition-all active:scale-98 shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Hubungi WhatsApp Sekarang</span>
            </button>
          </div>

        </div>

        {/* Drawer Footer / Contacts */}
        <div className="p-4 border-t border-[#2A140B]/8 bg-[#F3ECE2]/80 text-left text-xs text-[#5E3622] space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#B87932] flex-shrink-0" />
            <span className="truncate">Malibou Anai, Padang Pariaman, Sumbar</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#B87932] flex-shrink-0" />
            <span>0822-8356-9177 (Respon Cepat)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
