import React, { useState, useEffect } from 'react';
import { X, Trash2, MessageCircle, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';
import { formatRupiah, OFFICIAL_WHATSAPP_NUMBER } from '../data/products';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [notes, setNotes] = useState('');

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSendWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let message = `Halo Malibou Chocolate, saya ingin memesan:\n\n`;

    cart.forEach((item, index) => {
      const subtotal = item.product.price * item.quantity;
      message += `${index + 1}. ${item.product.name} (x${item.quantity}) = ${formatRupiah(subtotal)}\n`;
    });

    message += `\nTotal Pesanan: ${formatRupiah(totalPrice)} (${totalItems} item)\n`;

    if (customerName.trim()) {
      message += `Nama Pemesan: ${customerName.trim()}\n`;
    }
    if (customerCity.trim()) {
      message += `Alamat / Kota: ${customerCity.trim()}\n`;
    }
    if (notes.trim()) {
      message += `Catatan Khusus: ${notes.trim()}\n`;
    }

    message += `\nMohon konfirmasi ketersediaan stok, ongkos kirim, dan nomor rekening pembayaran resmi Malibou. Terima kasih!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  return (
    <div
      id="order-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-[#2A140B]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="order-drawer"
        className="w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between border-l border-[#2A140B]/10 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A140B]/8 flex items-center justify-between bg-white/90 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2A140B] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A140B]">
                Daftar Pesanan
              </h3>
              <span className="text-[11px] text-[#5E3622]">
                {totalItems} item dalam keranjang
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-[#F3ECE2] text-[#2A140B] transition-colors"
            aria-label="Tutup Keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-[#5E3622]">
              <div className="w-12 h-12 rounded-full bg-[#F3ECE2] mx-auto mb-3 flex items-center justify-center text-[#B87932]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="font-serif text-lg font-bold text-[#2A140B] mb-1">
                Keranjang Masih Kosong
              </p>
              <p className="text-xs max-w-xs mx-auto text-[#5E3622] mb-5 leading-relaxed font-normal">
                Pilih produk olahan cokelat, bubuk kakao murni, atau rendang spesial untuk memesan langsung ke WhatsApp.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[#2A140B] text-white text-xs font-semibold hover:bg-[#3A1F14] transition-colors shadow-2xs"
              >
                Jelajahi Produk Sekarang
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-white rounded-xl border border-[#2A140B]/8 flex gap-3 items-center shadow-2xs"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-lg object-contain p-1 bg-[#F3ECE2] flex-shrink-0"
                />

                <div className="flex-1 min-w-0 text-left">
                  <h4 className="font-serif font-bold text-sm text-[#2A140B] truncate">
                    {item.product.name}
                  </h4>
                  <span className="text-xs text-[#5E3622] font-medium block">
                    {formatRupiah(item.product.price)}
                    {item.product.unit ? ` / ${item.product.unit}` : ''}
                  </span>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-[#FAF7F2] border border-[#2A140B]/12 flex items-center justify-center text-[#2A140B] hover:bg-[#F3ECE2]"
                      aria-label="Kurang"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#2A140B] w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-[#FAF7F2] border border-[#2A140B]/12 flex items-center justify-center text-[#2A140B] hover:bg-[#F3ECE2]"
                      aria-label="Tambah"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch">
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-[#5E3622]/60 hover:text-red-700 p-1 transition-colors"
                    title="Hapus item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-sans font-bold text-xs text-[#2A140B]">
                    {formatRupiah(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Customer Details Form */}
          {cart.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#2A140B]/8 space-y-2.5 text-left">
              <span className="text-xs font-semibold text-[#5E3622] block">
                Detail Pemesan (Opsional):
              </span>
              <input
                type="text"
                placeholder="Nama Anda"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#2A140B]/12 text-[#2A140B] placeholder-[#5E3622]/50 focus:outline-none focus:border-[#B87932]"
              />
              <input
                type="text"
                placeholder="Kota / Alamat Pengiriman"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#2A140B]/12 text-[#2A140B] placeholder-[#5E3622]/50 focus:outline-none focus:border-[#B87932]"
              />
              <input
                type="text"
                placeholder="Catatan tambahan (misal: rasa / packaging oleh-oleh)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#2A140B]/12 text-[#2A140B] placeholder-[#5E3622]/50 focus:outline-none focus:border-[#B87932]"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#2A140B]/8 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-[#5E3622]">Total Estimasi:</span>
              <span className="font-serif font-bold text-lg sm:text-xl text-[#2A140B]">
                {formatRupiah(totalPrice)}
              </span>
            </div>

            <button
              onClick={handleSendWhatsAppOrder}
              className="w-full py-3 px-4 rounded-xl bg-[#2A140B] hover:bg-[#3A1F14] text-[#FAF7F2] font-semibold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Kirim Pesanan ke WhatsApp</span>
            </button>

            <button
              onClick={onClearCart}
              className="w-full mt-2 py-1 text-[11px] text-[#5E3622]/70 hover:text-red-700 transition-colors"
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
