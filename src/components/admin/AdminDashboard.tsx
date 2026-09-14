'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  X,
  Star,
  Package,
  Check,
  Menu,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { CATEGORIES, formatRupiah } from '../../data/products';
import { useProducts } from '../../context/ProductsProvider';
import {
  ADMIN_SESSION_KEY,
  ADMIN_SESSION_VALUE,
  ADMIN_USERNAME_KEY,
} from '../../lib/adminConfig';
import { LoginScreen } from './LoginScreen';
import { ProductFormModal } from './ProductFormModal';
import { DualConfirmModal } from './DualConfirmModal';
import { AdminSidebar, AdminView } from './AdminSidebar';
import { DashboardOverview } from './DashboardOverview';

const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as ProductCategory[];

type ConfirmState =
  | { kind: 'delete-product'; product: Product }
  | { kind: 'delete-selected' }
  | { kind: 'reset' }
  | { kind: 'logout' }
  | null;

const categoryBadge = (category: string): string => {
  switch (category) {
    case 'chocolate-bar':
      return 'bg-[#F3ECE2] text-[#5E3622]';
    case 'praline-snack':
      return 'bg-[#EFE4D4] text-[#7E4A30]';
    case 'chocolate-drink':
      return 'bg-[#E8BF87]/40 text-[#5E3622]';
    case 'cocoa-ingredients':
      return 'bg-[#243D2F]/12 text-[#243D2F]';
    case 'rendang':
      return 'bg-[#B87932]/15 text-[#8A4A12]';
    default:
      return 'bg-[#F3ECE2] text-[#5E3622]';
  }
};

export const AdminDashboard: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProducts, resetToDefault } =
    useProducts();

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [selection, setSelection] = useState<Set<number>>(() => new Set());
  const [defaultCategory, setDefaultCategory] = useState<ProductCategory>('chocolate-bar');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const session = window.sessionStorage.getItem(ADMIN_SESSION_KEY);
    const storedUser = window.sessionStorage.getItem(ADMIN_USERNAME_KEY) || '';
    setAuthed(session === ADMIN_SESSION_VALUE);
    setAdminUser(storedUser);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setSelection((prev) => {
      const valid = new Set(products.map((p) => p.id));
      return new Set([...prev].filter((id) => valid.has(id)));
    });
  }, [products]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
        );
      }
      return true;
    });
    switch (sortBy) {
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    return result;
  }, [products, search, categoryFilter, sortBy]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((p) => selection.has(p.id));

  const toggleAllVisible = () => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filtered.forEach((p) => next.delete(p.id));
      } else {
        filtered.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const toggleOne = (id: number) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const showToast = (message: string) => setToast(message);

  const handleLogin = (username: string) => {
    try {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, ADMIN_SESSION_VALUE);
      window.sessionStorage.setItem(ADMIN_USERNAME_KEY, username);
    } catch {
      // abaikan
    }
    setAdminUser(username);
    setAuthed(true);
    showToast(`Berhasil masuk sebagai ${username}.`);
  };

  const handleSave = (product: Product) => {
    const exists = products.some((p) => p.id === product.id);
    if (exists) {
      updateProduct(product);
      showToast('Perubahan produk berhasil disimpan.');
    } else {
      addProduct(product);
      showToast('Produk baru berhasil ditambahkan.');
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setDefaultCategory(categoryFilter !== 'all' ? categoryFilter : 'chocolate-bar');
    setIsFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setDefaultCategory(product.category);
    setIsFormOpen(true);
  };

  const toggleFeatured = (product: Product) => {
    updateProduct({ ...product, featured: !product.featured });
    showToast(
      !product.featured
        ? `"${product.name}" kini menjadi produk unggulan.`
        : `"${product.name}" tidak lagi unggulan.`
    );
  };

  const runConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === 'delete-product') {
      const { product } = confirm;
      deleteProducts([product.id]);
      showToast(`Produk "${product.name}" berhasil dihapus.`);
    } else if (confirm.kind === 'delete-selected') {
      const ids = Array.from(selection);
      deleteProducts(ids);
      setSelection(new Set());
      showToast(`${ids.length} produk berhasil dihapus.`);
    } else if (confirm.kind === 'reset') {
      resetToDefault();
      setSelection(new Set());
      showToast('Katalog dikembalikan ke data bawaan. Semua perubahan dibersihkan.');
    } else if (confirm.kind === 'logout') {
      try {
        window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
        window.sessionStorage.removeItem(ADMIN_USERNAME_KEY);
      } catch {
        // abaikan
      }
      setAuthed(false);
      setAdminUser('');
      setSelection(new Set());
      setSearch('');
      setCategoryFilter('all');
      setView('dashboard');
      setSidebarOpen(false);
      showToast('Anda telah keluar dari dashboard.');
    }
    setConfirm(null);
  };

  // ---------- Loading ----------
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F1E7]">
        <div className="text-center">
          <div className="w-9 h-9 mx-auto mb-3 rounded-full border-2 border-[#2A140B]/10 border-t-[#B87932] animate-spin" />
          <p className="text-xs text-[#5E3622]/70">Memuat dashboard…</p>
        </div>
      </div>
    );
  }

  // ---------- Login ----------
  if (!authed) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ---------- Dashboard ----------
  return (
    <div className="min-h-screen bg-[#F7F1E7] text-[#2A140B] lg:pl-64">
      <AdminSidebar
        view={view}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={setView}
        onLogout={() => setConfirm({ kind: 'logout' })}
        adminUser={adminUser}
        totalProducts={products.length}
      />

      <div className="flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#2A140B]/8">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka menu"
                className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-[#5E3622] hover:text-[#2A140B] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="font-serif text-base sm:text-lg font-bold text-[#2A140B] truncate">
                {view === 'dashboard' ? 'Ringkasan Dashboard' : 'Katalog Produk'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {view === 'products' && (
                <button
                  onClick={openAdd}
                  className="lg:hidden inline-flex items-center gap-1.5 min-h-[36px] px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#2A140B] hover:bg-[#3A1F14] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C58B47]" />
                  <span>Tambah</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {view === 'dashboard' ? (
            <DashboardOverview
              products={products}
              adminUser={adminUser}
              onManageProducts={() => setView('products')}
              onAddProduct={() => {
                setView('products');
                openAdd();
              }}
            />
          ) : (
            <>
              <div className="max-w-[1000px]">
              {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
          <div className="flex flex-1 gap-2.5 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#5E3622]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau kode produk…"
                aria-label="Cari produk"
                className="w-full pl-8 pr-8 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#2A140B]/10 text-[#2A140B] placeholder-[#5E3622]/40 focus:outline-none focus:border-[#B87932] focus-visible:ring-2 focus-visible:ring-[#B87932]/30 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#5E3622]/60 hover:text-[#2A140B] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              aria-label="Filter kategori"
              className="px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#2A140B]/10 text-[#2A140B] focus:outline-none focus:border-[#B87932] appearance-none cursor-pointer pr-8"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Urutkan produk"
              className="px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#2A140B]/10 text-[#2A140B] focus:outline-none focus:border-[#B87932] appearance-none cursor-pointer pr-8"
            >
              <option value="name">Urut: Nama (A–Z)</option>
              <option value="price-asc">Urut: Harga Terendah</option>
              <option value="price-desc">Urut: Harga Tertinggi</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setConfirm({ kind: 'reset' })}
              className="inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Katalog</span>
            </button>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#2A140B] hover:bg-[#3A1F14] shadow-xs transition-colors active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-[#C58B47]" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* Bulk selection bar */}
        {selection.size > 0 && (
          <div className="flex items-center justify-between gap-3 mb-4 px-4 py-3 rounded-xl bg-[#2A140B] text-[#FAF7F2]">
            <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#B87932] text-white text-[10px] font-bold">
                {selection.size}
              </span>
              produk dipilih
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelection(new Set())}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#EAE2D5] hover:text-white hover:bg-[#3A1F14] transition-colors"
              >
                Batalkan
              </button>
              <button
                onClick={() => setConfirm({ kind: 'delete-selected' })}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpilih
              </button>
            </div>
          </div>
        )}

        {/* List header + count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[#5E3622]/80">
            Menampilkan <strong className="text-[#2A140B]">{filtered.length}</strong> dari{' '}
            <strong className="text-[#2A140B]">{products.length}</strong> produk
          </p>
          {(search || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
              }}
              className="text-xs font-semibold text-[#B87932] hover:text-[#2A140B] transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Reset Filter
            </button>
          )}
        </div>

        {/* ---------- Desktop Table ---------- */}
        <div className="hidden lg:block bg-white rounded-2xl border border-[#2A140B]/10 shadow-xs overflow-x-auto">
          <div className="grid grid-cols-[28px_minmax(180px,1.4fr)_112px_92px_64px_104px] items-center gap-2 px-3 min-w-[600px] py-2.5 bg-[#F3ECE2]/70 border-b border-[#2A140B]/8 text-[10px] font-semibold uppercase tracking-wider text-[#5E3622]/80 whitespace-nowrap">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
                aria-label="Pilih semua produk"
                className="w-4 h-4 accent-[#B87932] cursor-pointer"
              />
            </div>
            <span>Produk</span>
            <span>Kategori</span>
            <span>Harga</span>
            <span>Unggulan</span>
            <span className="text-right">Aksi</span>
          </div>
          {filtered.length > 0 ? (
            filtered.map((p) => {
              const meta = [p.unit, p.weight].filter(Boolean).join(' · ');
              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-[28px_minmax(180px,1.4fr)_112px_92px_64px_104px] items-center gap-2 px-3 min-w-[600px] py-2.5 border-b border-[#2A140B]/6 last:border-b-0 transition-colors ${
                    selection.has(p.id) ? 'bg-[#B87932]/8' : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selection.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    aria-label={`Pilih ${p.name}`}
                    className="w-4 h-4 accent-[#B87932] cursor-pointer"
                  />
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F3ECE2] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#2A140B] truncate">{p.name}</p>
                      {meta && (
                        <p className="text-[11px] text-[#5E3622]/70 truncate">{meta}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold ${categoryBadge(p.category)}`}
                    >
                      {p.categoryName}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#2A140B]">{formatRupiah(p.price)}</span>
                  <button
                    onClick={() => toggleFeatured(p)}
                    aria-label={`${p.featured ? 'Nonaktifkan' : 'Aktifkan'} unggulan ${p.name}`}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      p.featured
                        ? 'text-[#B87932] bg-[#B87932]/12 hover:bg-[#B87932]/20'
                        : 'text-[#5E3622]/35 hover:text-[#B87932] bg-[#F3ECE2] hover:bg-[#EFE4D4]'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${p.featured ? 'fill-current' : ''}`} />
                  </button>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(p)}
                      aria-label={`Edit ${p.name}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5E3622] hover:text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirm({ kind: 'delete-product', product: p })}
                      aria-label={`Hapus ${p.name}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:text-white bg-red-50 hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              title="Tidak ada produk ditemukan"
              subtitle="Coba ubah kata kunci pencarian atau filter kategori."
            />
          )}
        </div>

        {/* ---------- Mobile Cards ---------- */}
        <div className="lg:hidden space-y-3">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border p-4 transition-colors ${
                  selection.has(p.id) ? 'border-[#B87932] ring-1 ring-[#B87932]/40' : 'border-[#2A140B]/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selection.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    aria-label={`Pilih ${p.name}`}
                    className="mt-1 w-4 h-4 accent-[#B87932] cursor-pointer"
                  />
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F3ECE2] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#2A140B] leading-snug">{p.name}</p>
                      </div>
                      <button
                        onClick={() => toggleFeatured(p)}
                        aria-label={`${p.featured ? 'Nonaktifkan' : 'Aktifkan'} unggulan`}
                        className={`shrink-0 p-1.5 rounded-lg transition-colors cursor-pointer ${
                          p.featured
                            ? 'text-[#B87932] bg-[#B87932]/12'
                            : 'text-[#5E3622]/35 bg-[#F3ECE2]'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${p.featured ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryBadge(p.category)}`}
                      >
                        {p.categoryName}
                      </span>
                      {p.unit && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3ECE2] text-[#5E3622]">
                          {p.unit}
                        </span>
                      )}
                      {p.weight && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3ECE2] text-[#5E3622]">
                          {p.weight}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2A140B]/6">
                  <span className="font-serif font-bold text-base text-[#2A140B]">
                    {formatRupiah(p.price)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirm({ kind: 'delete-product', product: p })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="Tidak ada produk ditemukan"
              subtitle="Coba ubah kata kunci pencarian atau filter kategori."
            />
          )}
        </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <ProductFormModal
        open={isFormOpen}
        product={editingProduct}
        defaultCategory={defaultCategory}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
      />

      <DualConfirmModal
        open={confirm?.kind === 'delete-product'}
        title="Hapus Produk"
        description={
          <>
            Anda akan menghapus produk{' '}
            <strong className="text-[#2A140B]">
              "{confirm?.kind === 'delete-product' ? confirm.product.name : ''}"
            </strong>
            . Produk tidak akan lagi tampil di katalog toko.
          </>
        }
        confirmLabel="Hapus"
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      <DualConfirmModal
        open={confirm?.kind === 'delete-selected'}
        title="Hapus Produk Terpilih"
        description={
          <>
            Anda akan menghapus <strong className="text-[#2A140B]">{selection.size}</strong> produk
            terpilih sekaligus dari katalog.
          </>
        }
        confirmLabel="Hapus Semua"
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      <DualConfirmModal
        open={confirm?.kind === 'reset'}
        title="Reset Katalog"
        description={
          <>
            Seluruh produk akan dikembalikan ke <strong className="text-[#2A140B]">30 data bawaan</strong>.
            Semua penambahan dan perubahan yang telah Anda lakukan akan dihapus permanen.
          </>
        }
        confirmLabel="Reset"
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      <DualConfirmModal
        open={confirm?.kind === 'logout'}
        title="Keluar dari Dashboard"
        description="Anda akan keluar dari sesi admin dan diminta memasukkan kata sandi kembali saat membuka dashboard berikutnya."
        confirmLabel="Keluar"
        accentDanger={false}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[60] bg-[#2A140B] text-[#FAF7F2] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm border border-[#B87932]/30 animate-[admin-toast-in_0.2s_ease-out]"
        >
          <div className="w-5 h-5 rounded-full bg-[#B87932] text-white flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-12 h-12 rounded-full bg-[#F3ECE2] text-[#5E3622]/50 flex items-center justify-center mb-3">
      <Package className="w-5 h-5" />
    </div>
    <p className="text-sm font-semibold text-[#2A140B] mb-1">{title}</p>
    <p className="text-xs text-[#5E3622]/70">{subtitle}</p>
  </div>
);