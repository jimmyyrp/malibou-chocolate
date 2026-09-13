'use client';

import React from 'react';
import { ProductsProvider } from '../../src/context/ProductsProvider';
import { CartProvider, useCart } from '../../src/context/CartProvider';
import { Navbar } from '../../src/components/Navbar';
import { Footer } from '../../src/components/Footer';
import { OrderDrawer } from '../../src/components/OrderDrawer';

function StorefrontShell({ children }: { children: React.ReactNode }) {
  const {
    cart,
    cartCount,
    isCartOpen,
    openCart,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2A140B] font-sans antialiased relative">
      <Navbar cartCount={cartCount} onOpenCart={openCart} />

      <main>{children}</main>

      <Footer />

      <OrderDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  );
}

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProductsProvider>
      <CartProvider>
        <StorefrontShell>{children}</StorefrontShell>
      </CartProvider>
    </ProductsProvider>
  );
}