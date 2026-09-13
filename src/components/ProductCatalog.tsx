import React, { useState, useMemo } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { CATEGORIES } from '../data/products';
import { useProducts } from '../context/ProductsProvider';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  selectedCategory: ProductCategory | 'all';
  onCategoryChange: (category: ProductCategory | 'all') => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  selectedCategory,
  onCategoryChange,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const { products } = useProducts();

  const filterTabs = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return [
      { id: 'all', label: 'Semua Produk', count: products.length },
      ...CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.name,
        count: counts[cat.id] || 0,
      })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="catalog" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#2A140B]/8 gap-5 text-left">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B87932] block mb-1.5">
            OUR PRODUCTS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A140B] tracking-tight">
            Pilihan Produk Malibou
          </h2>
          <p className="text-sm sm:text-base text-[#5E3622] mt-1 max-w-xl">
            Koleksi lengkap {products.length} produk olahan cokelat murni, bahan baku kakao Ranah Minang, dan varian spesial rendang.
          </p>
        </div>

        {/* Search and Sort controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#5E3622]/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari cokelat, bubuk kakao..."
              className="w-full pl-8 pr-7 py-2 text-xs sm:text-sm rounded-full bg-white border border-[#2A140B]/10 text-[#2A140B] placeholder-[#5E3622]/50 focus:outline-none focus:border-[#B87932] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#5E3622]/60 hover:text-[#2A140B]"
                aria-label="Bersihkan pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-3 pr-7 py-2 text-xs sm:text-sm rounded-full bg-white border border-[#2A140B]/10 text-[#2A140B] focus:outline-none focus:border-[#B87932] cursor-pointer appearance-none transition-colors"
              aria-label="Urutkan produk"
            >
              <option value="featured">Produk Unggulan</option>
              <option value="price-asc">Harga: Terendah</option>
              <option value="price-desc">Harga: Tertinggi</option>
              <option value="name">Nama: A – Z</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#5E3622]/60">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {filterTabs.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              id={`filter-tab-${tab.id}`}
              onClick={() => onCategoryChange(tab.id as any)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#2A140B] text-[#FAF7F2] font-semibold shadow-xs'
                  : 'bg-white hover:bg-[#F3ECE2] text-[#2A140B] border border-[#2A140B]/8'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                  isSelected ? 'bg-[#3A1F14] text-[#FAF7F2]' : 'bg-[#F3ECE2] text-[#5E3622]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Catalog Status Bar */}
      <div className="flex items-center justify-between mb-6 text-xs text-[#5E3622]/80">
        <span>
          Menampilkan <strong className="text-[#2A140B]">{filteredProducts.length}</strong> produk
          {selectedCategory !== 'all' && ' dalam kategori terpilih'}
        </span>
        {(searchQuery || selectedCategory !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              onCategoryChange('all');
            }}
            className="flex items-center gap-1 text-[#B87932] hover:text-[#2A140B] font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* Product Grid: 4 cols desktop, 3 cols tablet, 2 cols mobile */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#2A140B]/8 shadow-xs">
          <p className="text-sm text-[#5E3622] font-medium mb-3">
            Tidak ada produk yang cocok dengan kata kunci "{searchQuery}"
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onCategoryChange('all');
            }}
            className="px-4 py-2 rounded-full bg-[#2A140B] text-white text-xs font-semibold hover:bg-[#3A1F14] transition-colors"
          >
            Lihat Semua Produk
          </button>
        </div>
      )}
    </section>
  );
};
