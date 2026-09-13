import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Menu,
  MessageCircle,
  Home,
  Grid,
  Leaf,
  Flame,
  BookOpen,
  Phone,
} from 'lucide-react';
import { MalibouLogo } from './MalibouLogo';
import { MobileNavDrawer, NavItem } from './MobileNavDrawer';
import { ProductCategory } from '../types';
import { OFFICIAL_WHATSAPP_NUMBER } from '../data/products';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  onSelectCategory?: (category: ProductCategory) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onNavigate,
  activeSection,
  onSelectCategory,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Optimized passive scroll listener using requestAnimationFrame to prevent layout thrashing
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 15);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Main navigation items definition with semantic icons
  const navItems: NavItem[] = [
    { label: 'Beranda', id: 'hero', icon: Home },
    { label: 'Kategori', id: 'categories', icon: Grid },
    { label: 'Katalog Produk', id: 'catalog', icon: ShoppingBag },
    { label: 'Bahan Kakao', id: 'cocoa', icon: Leaf },
    { label: 'Koleksi Rendang', id: 'rendang', icon: Flame },
    { label: 'Tentang Kami', id: 'about', icon: BookOpen },
  ];

  const handleNavClick = useCallback(
    (id: string) => {
      onNavigate(id);
    },
    [onNavigate]
  );

  const handleDirectWhatsApp = () => {
    const message = encodeURIComponent(
      'Halo Malibou Chocolate, saya ingin mengetahui ketersediaan stok dan memesan produk cokelat & kakao.'
    );
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <>
      <header
        id="main-header"
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-200"
      >
        {/* Top Micro Announcement Bar (Luxury Editorial Touch) */}
        <div
          id="top-announcement-bar"
          className="bg-[#241209] text-[#FAF7F2] border-b border-[#3A1F14]/40 text-[11px] sm:text-xs py-1.5 px-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C58B47]" />
              <span className="font-normal text-[#EAE2D5] truncate">
                Cita Rasa Kakao Asli Ranah Minang • Pengiriman ke Seluruh Indonesia
              </span>
            </div>

            <a
              href={`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-[#C58B47] hover:text-[#FAF7F2] font-medium transition-colors ml-4 flex-shrink-0"
            >
              <Phone className="w-3 h-3" />
              <span>WhatsApp: 0822-8356-9177</span>
            </a>
          </div>
        </div>

        {/* Main Navbar Container (Zero CLS with stable height h-16 sm:h-20) */}
        <div
          id="main-navbar"
          className={`w-full transition-all duration-200 ${
            isScrolled
              ? 'bg-[#FAF7F2]/95 backdrop-blur-md shadow-[0_4px_24px_rgba(42,20,11,0.05)] border-b border-[#2A140B]/8'
              : 'bg-[#FAF7F2]/90 backdrop-blur-xs border-b border-[#2A140B]/6'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              
              {/* Left: Brand Logo Button */}
              <button
                id="nav-logo-link"
                onClick={() => handleNavClick('hero')}
                className="flex items-center text-left py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B87932] transition-opacity hover:opacity-90"
                aria-label="Malibou Chocolate - Kembali ke Beranda"
              >
                <MalibouLogo size="sm" hideSubOnMobile={true} />
              </button>

              {/* Center: Desktop Navigation Links (Visible on Large screens) */}
              <nav
                className="hidden lg:flex items-center space-x-1"
                aria-label="Navigasi Utama"
              >
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-link-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`min-h-[40px] px-3.5 py-2 rounded-full text-xs tracking-wider transition-all font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B87932] ${
                        isActive
                          ? 'text-[#2A140B] bg-[#F3ECE2] font-semibold shadow-2xs'
                          : 'text-[#5E3622] hover:text-[#2A140B] hover:bg-[#F3ECE2]/60'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Right: Actions (Cart Button + Direct WhatsApp Order + Mobile Drawer Toggle) */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                
                {/* Cart Drawer Trigger (Accessible min 44x44px target) */}
                <button
                  id="nav-cart-trigger"
                  onClick={onOpenCart}
                  className="relative min-w-[44px] min-h-[44px] rounded-full bg-white hover:bg-[#F3ECE2]/60 text-[#2A140B] border border-[#2A140B]/10 shadow-2xs transition-transform active:scale-95 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B87932]"
                  aria-label={`Keranjang Pesanan, ${cartCount} item`}
                >
                  <ShoppingBag className="w-4 h-4 text-[#2A140B]" />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 flex items-center justify-center bg-[#B87932] text-white text-[10px] font-bold rounded-full border-2 border-[#FAF7F2]"
                      aria-hidden="true"
                    >
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Direct Order Button (Visible on tablet & desktop) */}
                <button
                  id="nav-direct-order-btn"
                  onClick={handleDirectWhatsApp}
                  className="hidden sm:inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full bg-[#2A140B] hover:bg-[#3A1F14] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase transition-all shadow-2xs hover:shadow-xs active:scale-98 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B87932]"
                >
                  <span>Pesan Cepat</span>
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                </button>

                {/* Mobile / Tablet Menu Button (Accessible min 44x44px hit target) */}
                <button
                  id="nav-mobile-menu-btn"
                  onClick={() => setIsDrawerOpen(true)}
                  className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white hover:bg-[#F3ECE2] text-[#2A140B] border border-[#2A140B]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B87932]"
                  aria-label="Buka menu navigasi"
                  aria-expanded={isDrawerOpen}
                  aria-controls="mobile-navigation-drawer"
                >
                  <Menu className="w-5 h-5" />
                </button>

              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Component */}
      <MobileNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navItems={navItems}
        activeSection={activeSection}
        onNavigate={handleNavClick}
        onSelectCategory={onSelectCategory}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
      />
    </>
  );
};
