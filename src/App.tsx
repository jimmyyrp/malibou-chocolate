'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, CartItem } from './types';
import { loadProducts } from './data/productsStore';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { QuickCategory } from './components/QuickCategory';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CocoaSection } from './components/CocoaSection';
import { RendangSection } from './components/RendangSection';
import { WhyMalibou } from './components/WhyMalibou';
import { AboutMalibou } from './components/AboutMalibou';
import { CtaOrder } from './components/CtaOrder';
import { Footer } from './components/Footer';
import { OrderDrawer } from './components/OrderDrawer';
import { Check } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('malibou_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved) as CartItem[];
      if (!Array.isArray(parsed)) return [];
      // Buang produk lama yang sudah tidak ada di katalog terbaru
      const validIds = new Set(loadProducts().map((p) => p.id));
      return parsed.filter(
        (item) => item?.product && validIds.has(item.product.id)
      );
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('malibou_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Scrollspy via IntersectionObserver to dynamically highlight active nav section
  useEffect(() => {
    const sectionIds = ['hero', 'categories', 'catalog', 'cocoa', 'rendang', 'about'];
    const observers: IntersectionObserver[] = [];

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const options = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleIntersect, options);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Show temporary toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { product, quantity }];
      }
    });
    showToast(`${product.name} ditambahkan ke daftar pesanan`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSelectCategoryFromQuick = (category: ProductCategory) => {
    setSelectedCategory(category);
    scrollToSection('catalog');
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2A140B] font-sans antialiased relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#2A140B] text-[#FAF7F2] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm border border-[#B87932]/30 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-[#B87932] text-white flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (Sticky Navbar + Micro Announcement Bar) */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={scrollToSection}
        activeSection={activeSection}
        onSelectCategory={handleSelectCategoryFromQuick}
      />

      {/* 2. Hero Section */}
      <main>
        <Hero
          onExploreProducts={() => scrollToSection('catalog')}
          onOpenOrderModal={() => setIsCartOpen(true)}
        />

        {/* 3. Quick Category */}
        <QuickCategory onSelectCategory={handleSelectCategoryFromQuick} />

        {/* 4 & 5. Product Catalog & Card Grid */}
        <ProductCatalog
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSelectProduct={(product) => setSelectedProduct(product)}
          onQuickAdd={(product) => handleAddToCart(product, 1)}
        />

        {/* 7. Section Khusus Cacao (From Cocoa) */}
        <CocoaSection
          onExploreCocoa={() => {
            setSelectedCategory('cocoa-ingredients');
            scrollToSection('catalog');
          }}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* 8. Section Rendang (Special Collection) */}
        <RendangSection
          onViewRendangCatalog={() => {
            setSelectedCategory('rendang');
            scrollToSection('catalog');
          }}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* 9. Why Malibou? */}
        <WhyMalibou />

        {/* 10. About Malibou */}
        <AboutMalibou />

        {/* 11. CTA Order */}
        <CtaOrder />
      </main>

      {/* 12. Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToSection('catalog');
        }}
        onNavigate={scrollToSection}
      />

      {/* 6. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart / Order Drawer */}
      <OrderDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </div>
  );
}