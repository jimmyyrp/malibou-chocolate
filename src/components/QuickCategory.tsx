import React from 'react';
import { ArrowRight, Sparkles, Utensils, Coffee, Leaf, Flame } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { ProductCategory } from '../types';
import { useProducts } from '../context/ProductsProvider';

interface QuickCategoryProps {
  onSelectCategory: (categoryId: ProductCategory) => void;
}

export const QuickCategory: React.FC<QuickCategoryProps> = ({ onSelectCategory }) => {
  const { products } = useProducts();

  const categoryMeta: Record<
    string,
    { icon: React.ComponentType<{ className?: string }>; desc: string }
  > = {
    'chocolate-bar': {
      icon: Sparkles,
      desc: 'Coklat batangan 70%–100% & varian balado',
    },
    'praline-snack': {
      icon: Utensils,
      desc: 'Coklat paralin kemasan pouch, kotak & botol',
    },
    'chocolate-drink': {
      icon: Coffee,
      desc: 'Minuman bubuk 3in1 & sachet siap seduh',
    },
    'cocoa-ingredients': {
      icon: Leaf,
      desc: 'Bubuk kakao murni, butter & biji fermentasi',
    },
    'ball-choco': {
      icon: Sparkles,
      desc: 'Cokelat renyah isi lembut untuk camilan',
    },
    rendang: {
      icon: Flame,
      desc: 'Rendang Minang autentik & Rendang Coklat',
    },
  };

  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  return (
    <section id="categories" className="py-16 md:py-20 bg-[#F3ECE2] border-b border-[#2A140B]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B87932] block mb-2">
            EXPLORE OUR PRODUCTS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A140B] tracking-tight mb-2.5">
            Pilihan Kategori Malibou
          </h2>
          <p className="text-sm sm:text-base text-[#5E3622] leading-relaxed">
            Temukan berbagai kreasi olahan cokelat dan bahan kakao Malibou untuk dinikmati langsung, dibagikan, maupun diolah kembali.
          </p>
        </div>

        {/* 6 Proportional Minimalist Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const meta = categoryMeta[cat.id] || { icon: Sparkles, desc: '' };
            const Icon = meta.icon;

            return (
              <button
                key={cat.id}
                id={`cat-card-${cat.id}`}
                onClick={() => onSelectCategory(cat.id as ProductCategory)}
                className="group relative flex flex-col p-5 rounded-2xl bg-white hover:bg-[#FAF7F2] border border-[#2A140B]/8 hover:border-[#B87932]/40 shadow-xs hover:shadow-md transition-all duration-300 text-left cursor-pointer active:scale-[0.99]"
              >
                {/* Top bar: Icon & Product Count */}
                <div className="flex items-center justify-between mb-4 w-full">
                  <div className="w-9 h-9 rounded-xl bg-[#F3ECE2] group-hover:bg-[#2A140B] group-hover:text-white flex items-center justify-center text-[#5E3622] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-medium text-[#B87932] px-2 py-0.5 rounded-full bg-[#F3ECE2]/80">
                    {categoryCounts[cat.id] ?? cat.count} Produk
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg font-bold text-[#2A140B] group-hover:text-[#5E3622] transition-colors mb-1">
                  {cat.name}
                </h3>

                {/* Descriptive subline */}
                <p className="text-xs text-[#5E3622]/80 line-clamp-2 leading-relaxed mb-4">
                  {meta.desc}
                </p>

                {/* Clean inline navigation link */}
                <div className="mt-auto pt-3 border-t border-[#2A140B]/6 w-full flex items-center justify-between text-xs font-semibold text-[#B87932]">
                  <span>Jelajahi</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
