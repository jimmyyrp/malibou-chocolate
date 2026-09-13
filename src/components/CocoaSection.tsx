import React from 'react';
import { ArrowRight, Leaf, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../data/products';
import { useProducts } from '../context/ProductsProvider';

interface CocoaSectionProps {
  onExploreCocoa: () => void;
  onSelectProduct: (product: Product) => void;
}

export const CocoaSection: React.FC<CocoaSectionProps> = ({
  onExploreCocoa,
  onSelectProduct,
}) => {
  const { products } = useProducts();
  // Signature cocoa ingredient products
  const cocoaProducts = products
    .filter((p) => p.category === 'cocoa-ingredients')
    .slice(0, 3);

  return (
    <section id="cocoa" className="py-20 md:py-24 bg-[#F3ECE2] border-b border-[#2A140B]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Cocoa Philosophy & Positioning */}
          <div className="lg:col-span-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#243D2F] text-[#FAF7F2] text-[10px] font-semibold tracking-[0.18em] uppercase mb-4 shadow-2xs">
              <Leaf className="w-3 h-3 text-[#C58B47]" />
              <span>FROM COCOA</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A140B] leading-[1.12] mb-4">
              Lebih dari sekadar cokelat.
            </h2>

            <p className="text-base text-[#5E3622] leading-relaxed mb-6 font-normal">
              Explore berbagai produk berbasis kakao untuk kebutuhan konsumsi maupun kreasi.
              Malibou memproses biji kakao murni dari perkebunan Sumatera Barat dengan fermentasi terukur dan teknik ekstraksi murni.
            </p>

            {/* 3 Pure Ingredients Editorial Overview */}
            <div className="space-y-3.5 mb-8 border-l-2 border-[#B87932]/40 pl-4">
              <div>
                <strong className="text-sm font-semibold text-[#2A140B] block">Cocoa Powder Murni</strong>
                <p className="text-xs text-[#5E3622] leading-relaxed">
                  Karakter warna pekat dan aroma cokelat mendalam untuk racikan bakery, kue, dan minuman hangat.
                </p>
              </div>
              <div>
                <strong className="text-sm font-semibold text-[#2A140B] block">Cocoa Butter Alami</strong>
                <p className="text-xs text-[#5E3622] leading-relaxed">
                  Lemak kakao alami hasil kempa murni tanpa pewangi buatan untuk kebutuhan baking dan olahan cokelat.
                </p>
              </div>
              <div>
                <strong className="text-sm font-semibold text-[#2A140B] block">Biji Kakao Fermentasi</strong>
                <p className="text-xs text-[#5E3622] leading-relaxed">
                  Biji kakao siap sangrai dari perkebunan Padang Pariaman untuk pengrajin cokelat rumahan dan riset pangan.
                </p>
              </div>
            </div>

            <button
              onClick={onExploreCocoa}
              className="px-6 py-3 rounded-full bg-[#2A140B] hover:bg-[#3A1F14] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase transition-all shadow-xs flex items-center gap-2 active:scale-98"
            >
              <span>Explore Cocoa Products</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C58B47]" />
            </button>
          </div>

          {/* Right: Curated Showcase of the 3 Ingredients */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cocoaProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectProduct(item)}
                  className="group bg-white rounded-2xl p-3 sm:p-4 border border-[#2A140B]/8 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col text-left"
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#F3ECE2] mb-3 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                    <div className="absolute inset-0 bg-[#2A140B]/0 group-hover:bg-[#2A140B]/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-md bg-white/90 text-[#2A140B] text-[10px] font-semibold transition-opacity flex items-center gap-1 shadow-xs">
                        <Eye className="w-3 h-3" />
                        <span>Detail</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-semibold text-[#B87932] tracking-wider mb-1 block">
                    {item.categoryName}
                  </span>

                  <h4 className="font-serif font-bold text-[#2A140B] text-sm mb-1.5 group-hover:text-[#5E3622] line-clamp-1">
                    {item.name}
                  </h4>

                  <span className="text-[11px] text-[#5E3622]/75 mb-3 line-clamp-1 block">
                    {item.weight ? `Kemasan ${item.weight}` : 'Kemasan Higienis'}
                  </span>

                  <div className="mt-auto pt-2.5 border-t border-[#2A140B]/6 flex items-center justify-between">
                    <span className="font-sans font-bold text-xs sm:text-sm text-[#2A140B]">
                      {formatRupiah(item.price)}
                    </span>
                    <span className="text-[11px] text-[#B87932] font-semibold flex items-center gap-0.5">
                      Lihat →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Note banner under products */}
            <div className="mt-5 p-3.5 sm:p-4 rounded-xl bg-white border border-[#2A140B]/8 shadow-2xs flex items-center gap-3 text-left">
              <span className="text-xl flex-shrink-0">🌱</span>
              <p className="text-xs text-[#5E3622] leading-relaxed">
                Tersedia ukuran retail (250g / 300g) serta kemasan curah 1 kg untuk cafe, bakery, dan usaha kuliner. Konsultasi pasokan via WhatsApp resmi Malibou.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
