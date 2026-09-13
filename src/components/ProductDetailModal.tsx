import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Plus, Minus, Check, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah, OFFICIAL_WHATSAPP_NUMBER } from '../data/products';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Reset quantity when modal opens for a new product
  useEffect(() => {
    setQuantity(1);
  }, [product]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleDirectWhatsApp = () => {
    const totalPrice = product.price * quantity;
    const message = encodeURIComponent(
      `Halo Malibou Chocolate, saya ingin memesan:\n\n` +
      `• Produk: ${product.name}\n` +
      `• Kategori: ${product.categoryName}\n` +
      `• Jumlah: ${quantity} item\n` +
      `• Total: ${formatRupiah(totalPrice)}\n\n` +
      `Mohon info ketersediaan stok & pengiriman ke alamat saya. Terima kasih!`
    );
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleAddAndClose = () => {
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 500);
  };

  return (
    <div
      id="product-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2A140B]/65 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="product-detail-modal"
        className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#2A140B]/10 overflow-hidden flex flex-col md:flex-row my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 min-w-[36px] min-h-[36px] rounded-full bg-white/95 hover:bg-white text-[#2A140B] flex items-center justify-center shadow-xs transition-colors border border-[#2A140B]/10"
          aria-label="Tutup Detail"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Product Image */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-[#F3ECE2] relative min-h-[240px] md:min-h-[380px]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Product Specification */}
        <div className="w-full md:w-1/2 p-5 sm:p-7 flex flex-col justify-between text-left">
          <div>
            {/* Category tag */}
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#B87932] block mb-1">
              {product.categoryName}
            </span>

            {/* Product Name */}
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2A140B] leading-snug mb-2">
              {product.name}
            </h3>

            {/* Price tag */}
            <div className="flex items-baseline gap-2.5 mb-4 flex-wrap">
              <span className="font-sans font-bold text-xl sm:text-2xl text-[#2A140B]">
                {formatRupiah(product.price)}
              </span>
              {product.unit && (
                <span className="text-xs font-medium text-[#5E3622] px-2 py-0.5 rounded bg-[#F3ECE2] border border-[#2A140B]/6">
                  Satuan: {product.unit}
                </span>
              )}
              {product.weight && (
                <span className="text-xs font-medium text-[#5E3622] px-2 py-0.5 rounded bg-[#F3ECE2] border border-[#2A140B]/6">
                  Netto: {product.weight}
                </span>
              )}
            </div>

            {/* Honest Description */}
            <p className="text-xs sm:text-sm text-[#2A140B]/85 leading-relaxed mb-5 font-normal">
              {product.description}
            </p>

            {/* Genuine Origin Assurance */}
            <div className="flex items-center gap-2 text-xs text-[#5E3622] p-2.5 rounded-xl bg-[#F3ECE2] border border-[#2A140B]/8 mb-5">
              <ShieldCheck className="w-4 h-4 text-[#B87932] flex-shrink-0" />
              <span>Produksi asli Malibou Chocolate, Sumatera Barat.</span>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-2">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-semibold text-[#5E3622]">Jumlah:</span>
              <div className="flex items-center border border-[#2A140B]/12 rounded-full bg-white px-2 py-0.5 shadow-2xs">
                <button
                  onClick={handleDecrease}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#2A140B] hover:bg-[#F3ECE2] disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label="Kurangi kuantitas"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-bold text-xs text-[#2A140B]">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#2A140B] hover:bg-[#F3ECE2]"
                  aria-label="Tambah kuantitas"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Buttons: Direct WhatsApp & Add to Cart */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDirectWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2A140B] text-[#FAF7F2] hover:bg-[#3A1F14] text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Pesan Cepat via WhatsApp</span>
              </button>

              <button
                onClick={handleAddAndClose}
                className="w-full py-2 px-4 rounded-xl bg-white hover:bg-[#F3ECE2] text-[#2A140B] border border-[#2A140B]/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-2xs"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#243D2F]" />
                    <span>Ditambahkan ke Pesanan</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-[#B87932]" />
                    <span>Tambah ke Daftar Pesanan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
