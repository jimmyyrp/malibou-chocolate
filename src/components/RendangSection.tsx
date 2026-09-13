import React, { useState } from 'react';
import { ArrowRight, Flame, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah, OFFICIAL_WHATSAPP_NUMBER } from '../data/products';
import { useProducts } from '../context/ProductsProvider';

interface RendangSectionProps {
  onViewRendangCatalog: () => void;
  onSelectProduct: (product: Product) => void;
}

export const RendangSection: React.FC<RendangSectionProps> = ({
  onViewRendangCatalog,
  onSelectProduct,
}) => {
  const { products } = useProducts();
  const rendangProducts = products.filter((p) => p.category === 'rendang');
  const [activeFilter, setActiveFilter] = useState<'all' | 'coklat' | 'klasik'>('all');

  const coklatCount = rendangProducts.filter(
    (item) => item.name.toLowerCase().includes('coklat')
  ).length;
  const klasikCount = rendangProducts.length - coklatCount;

  const filteredRendangs = rendangProducts.filter((item) => {
    if (activeFilter === 'coklat') {
      return item.name.toLowerCase().includes('coklat');
    }
    if (activeFilter === 'klasik') {
      return !item.name.toLowerCase().includes('coklat');
    }
    return true;
  });

  const handleOrderSpecific = (product: Product) => {
    const message = encodeURIComponent(
      `Halo Malibou Chocolate, saya ingin memesan produk kuliner: ${product.name} (${formatRupiah(product.price)}). Mohon info stok & pengirimannya.`
    );
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <section id="rendang" className="py-20 md:py-24 bg-[#FAF7F2] border-b border-[#2A140B]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#2A140B]/8 gap-6 text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE2] text-[#5E3622] text-[10px] font-semibold tracking-[0.18em] uppercase mb-3 border border-[#2A140B]/6">
              <Flame className="w-3 h-3 text-[#B87932]" />
              <span>MALIBOU SPECIAL COLLECTION</span>
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A140B] tracking-tight mb-2.5">
              Koleksi Rendang Ranah Minang
            </h2>

            <p className="text-sm sm:text-base text-[#5E3622] leading-relaxed">
              Eksplorasi cita rasa khas Indonesia dalam pilihan produk rendang Malibou.
              Menghadirkan harmoni rempah tradisional Minangkabau dengan varian inovasi <em>Rendang Coklat Daging & Paru</em>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#2A140B] text-[#FAF7F2] shadow-2xs font-semibold'
                  : 'bg-white text-[#2A140B] border border-[#2A140B]/10 hover:bg-[#F3ECE2]'
              }`}
            >
              Semua ({rendangProducts.length})
            </button>
            <button
              onClick={() => setActiveFilter('coklat')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === 'coklat'
                  ? 'bg-[#2A140B] text-[#FAF7F2] shadow-2xs font-semibold'
                  : 'bg-white text-[#2A140B] border border-[#2A140B]/10 hover:bg-[#F3ECE2]'
              }`}
            >
              Inovasi Coklat ({coklatCount})
            </button>
            <button
              onClick={() => setActiveFilter('klasik')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === 'klasik'
                  ? 'bg-[#2A140B] text-[#FAF7F2] shadow-2xs font-semibold'
                  : 'bg-white text-[#2A140B] border border-[#2A140B]/10 hover:bg-[#F3ECE2]'
              }`}
            >
              Klasik Minang ({klasikCount})
            </button>
          </div>
        </div>

        {/* Rendang Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredRendangs.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-[#2A140B]/8 p-3 sm:p-4 flex flex-col justify-between shadow-[0_4px_16px_rgba(42,20,11,0.03)] hover:shadow-md hover:border-[#B87932]/30 transition-all text-left"
            >
              <div>
                <div
                  onClick={() => onSelectProduct(item)}
                  className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#F3ECE2] mb-3 cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  {item.weight && (
                    <div className="absolute bottom-2 right-2">
                      <span className="px-1.5 py-0.5 rounded bg-white/95 text-[#5E3622] text-[10px] font-medium border border-[#2A140B]/8 backdrop-blur-xs">
                        {item.weight}
                      </span>
                    </div>
                  )}
                </div>

                <span className="text-[10px] uppercase font-semibold text-[#B87932] tracking-wider block mb-1 truncate">
                  {item.categoryName}
                </span>

                <h4
                  onClick={() => onSelectProduct(item)}
                  className="font-serif font-bold text-sm sm:text-base text-[#2A140B] group-hover:text-[#5E3622] line-clamp-1 cursor-pointer transition-colors"
                >
                  {item.name}
                </h4>

                <p className="text-xs text-[#5E3622]/80 line-clamp-2 mt-1 mb-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#2A140B]/6 flex items-center justify-between gap-1">
                <span className="font-sans font-bold text-sm text-[#2A140B]">
                  {formatRupiah(item.price)}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectProduct(item)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE2] text-xs font-semibold text-[#2A140B] border border-[#2A140B]/8 transition-colors"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleOrderSpecific(item)}
                    aria-label={`Pesan ${item.name} via WhatsApp`}
                    className="p-1.5 rounded-lg bg-[#2A140B] hover:bg-[#3A1F14] text-white transition-colors"
                    title="Pesan via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-10 text-center">
          <button
            onClick={onViewRendangCatalog}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2A140B] hover:bg-[#3A1F14] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase transition-all shadow-xs active:scale-98"
          >
            <span>Buka di Katalog Utama ({rendangProducts.length} Varian)</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C58B47]" />
          </button>
        </div>

      </div>
    </section>
  );
};
