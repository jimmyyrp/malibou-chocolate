'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Image as ImageIcon, Check, Upload, Loader2 } from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { CATEGORIES, formatRupiah } from '../../data/products';
import { newProductId, nextProductCode } from '../../data/productsStore';
import { useProducts } from '../../context/ProductsProvider';
import {
  PRODUCT_IMAGES_BUCKET,
  supabaseAdmin,
  supabasePublic,
  toSafeImageUrl,
} from '../../lib/supabase';

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  defaultCategory: ProductCategory;
  onClose: () => void;
  onSave: (product: Product) => void;
}

interface FormErrors {
  name?: string;
  price?: string;
  imageUrl?: string;
}

const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as ProductCategory[];

const UNIT_OPTIONS = ['pcs', 'pouch', 'box', 'botol', 'pack', 'renteng', 'gram', 'sachet'];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  product,
  defaultCategory,
  onClose,
  onSave,
}) => {
  const { products } = useProducts();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ProductCategory>(defaultCategory);
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isEdit = !!product;

  useEffect(() => {
    if (!open) return;
    if (product) {
      setName(product.name);
      setCode(product.code);
      setCategory(product.category);
      setPrice(String(product.price));
      setWeight(product.weight || '');
      setUnit(product.unit || 'pcs');
      setImageUrl(product.imageUrl);
      setDescription(product.description);
      setFeatured(!!product.featured);
    } else {
      setName('');
      setCode('');
      setCategory(defaultCategory);
      setPrice('');
      setWeight('');
      setUnit('pcs');
      setImageUrl('');
      setDescription('');
      setFeatured(false);
    }
    setErrors({});
    setUploadError(null);
  }, [open, product, defaultCategory]);

  useEffect(() => {
    if (!open || product) return;
    setCode(nextProductCode(category, products));
  }, [open, product, category, products]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const priceNumber = useMemo(() => {
    const n = parseInt(price.replace(/\D/g, ''), 10) || 0;
    return n;
  }, [price]);

  const imageUrlValid = useMemo(() => {
    if (!imageUrl.trim()) return false;
    try {
      const url = new URL(imageUrl.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, [imageUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (jpeg/png/webp/gif/avif).');
      return;
    }

    const client = supabaseAdmin ?? supabasePublic;
    if (!client) {
      setUploadError(
        'Supabase belum dikonfigurasi. Isi env lalu build ulang, atau pakai URL langsung.'
      );
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const cleanCode = (code.trim() || 'new')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .toLowerCase();
      const extMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/avif': 'avif',
      };
      const ext = extMap[file.type] || 'jpg';
      const path = `products/${cleanCode}-${Date.now()}.${ext}`;

      const { error: upErr } = await client.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw new Error(upErr.message);

      setImageUrl(toSafeImageUrl(path));
    } catch (err) {
      setUploadError(
        err instanceof Error && err.message
          ? err.message
          : 'Gagal mengunggah gambar ke bucket.'
      );
    } finally {
      setUploading(false);
    }
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!name.trim()) {
      nextErrors.name = 'Nama produk wajib diisi.';
    } else if (name.trim().length < 2) {
      nextErrors.name = 'Nama produk terlalu pendek (min. 2 karakter).';
    }
    if (!priceNumber || priceNumber <= 0) {
      nextErrors.price = 'Harga harus berupa angka lebih dari 0.';
    }
    if (imageUrl.trim() && !imageUrlValid) {
      nextErrors.imageUrl = 'URL gambar harus diawali http:// atau https://.';
    } else if (!imageUrl.trim()) {
      nextErrors.imageUrl = 'Unggah gambar ke bucket atau isi URL produk.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setErrors((prev) => ({ ...prev, _touched: true }));
      return;
    }

    const categoryValue = CATEGORY_IDS.includes(category) ? category : 'chocolate-bar';
    const categoryName =
      CATEGORIES.find((c) => c.id === categoryValue)?.name || 'Coklat Batangan';

    const next: Product = {
      id: product ? product.id : newProductId(),
      code: code.trim() || nextProductCode(categoryValue, products),
      name: name.trim(),
      category: categoryValue,
      categoryName,
      price: priceNumber,
      unit: unit.trim() || 'pcs',
      weight: weight.trim() || undefined,
      description: description.trim(),
      imageUrl: toSafeImageUrl(imageUrl),
      featured,
    };
    onSave(next);
  };

  if (!open) return null;

  const fieldBase =
    'w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-[#2A140B] placeholder-[#5E3622]/40 focus:outline-none focus-visible:ring-2 transition-colors';
  const fieldOk = `${fieldBase} border-[#2A140B]/10 focus-visible:ring-[#B87932] focus:border-[#B87932]`;
  const fieldErr = `${fieldBase} border-red-400 focus-visible:ring-red-300`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-[admin-fade-in_0.15s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div
        className="absolute inset-0 bg-[#1C0D06]/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] bg-[#FAF7F2] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#2A140B]/10 flex flex-col overflow-hidden animate-[admin-pop-in_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A140B]/8 bg-white">
          <div>
            <h2 id="product-form-title" className="font-serif text-lg font-bold text-[#2A140B]">
              {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h2>
            <p className="text-[11px] text-[#5E3622]/70">
              {isEdit ? `Kode saat ini: ${product.code}` : 'Lengkapi detail produk di bawah ini.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup formulir"
            className="p-2 rounded-lg text-[#5E3622]/60 hover:text-[#2A140B] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form
          id="admin-product-form"
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="pf-category" className="block text-xs font-semibold text-[#5E3622] mb-1.5">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="pf-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className={`${fieldOk} appearance-none bg-white cursor-pointer`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="pf-code" className="block text-xs font-semibold text-[#5E3622] mb-1.5">
                Kode Produk
              </label>
              <input
                id="pf-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Otomatis"
                className={fieldOk}
              />
            </div>
          </div>

          <div>
            <label htmlFor="pf-name" className="block text-xs font-semibold text-[#5E3622] mb-1.5">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              id="pf-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Coklat Batangan 70%"
              className={errors.name ? fieldErr : fieldOk}
            />
            {errors.name && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pf-price" className="block text-xs font-semibold text-[#5E3622] mb-1.5">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                id="pf-price"
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="35000"
                className={errors.price ? fieldErr : fieldOk}
              />
              {priceNumber > 0 && (
                <p className="mt-1 text-[11px] text-[#B87932] font-medium">
                  {formatRupiah(priceNumber)}
                </p>
              )}
              {errors.price && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.price}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="pf-unit" className="block text-xs font-semibold text-[#5E3622] mb-1.5">
                Satuan
              </label>
              <select
                id="pf-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`${fieldOk} appearance-none bg-white cursor-pointer`}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="pf-weight" className="block text-xs font-semibold text-[#5E3622] mb-1.5">
              Berat / Kemasan
            </label>
            <input
              id="pf-weight"
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Contoh: 250gr"
              className={fieldOk}
            />
          </div>

          <div>
            <label htmlFor="pf-image" className="block text-xs font-semibold text-[#5E3622] mb-1.5">
              Gambar Produk
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  id="pf-image"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="URL gambar atau path bucket (mis. products/cb-070.jpg)"
                  className={errors.imageUrl ? fieldErr : fieldOk}
                />
              </div>
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F3ECE2] border border-[#2A140B]/10 flex items-center justify-center flex-shrink-0">
                {imageUrlValid ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Pratinjau produk"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-[#5E3622]/40" />
                )}
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !code.trim()}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2A140B] bg-white border border-[#2A140B]/15 hover:bg-[#F3ECE2] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#B87932]" />
                ) : (
                  <Upload className="w-4 h-4 text-[#B87932]" />
                )}
                <span>{uploading ? 'Mengunggah…' : 'Unggah ke Bucket'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {imageUrl && (
                <span className="text-[11px] text-[#5E3622]/60">
                  Tersimpan di bucket{' '}
                  <code className="text-[#B87932]">{PRODUCT_IMAGES_BUCKET}</code>
                </span>
              )}
            </div>
            {!code.trim() && (
              <p className="mt-1 text-[11px] text-[#5E3622]/60">
                Isi kode produk dulu agar gambar tersimpan ke bucket (kode-<code>timestamp</code>).
              </p>
            )}
            {uploadError && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                {uploadError}
              </p>
            )}
            {errors.imageUrl && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                {errors.imageUrl}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pf-desc" className="block text-xs font-semibold text-[#5E3622] mb-1.5">
              Deskripsi
            </label>
            <textarea
              id="pf-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ceritakan detail, rasa, dan keunggulan produk…"
              className={`${fieldBase} border-[#2A140B]/10 focus-visible:ring-[#B87932] focus:border-[#B87932] resize-none`}
            />
          </div>

          <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#2A140B]/10 cursor-pointer">
            <div>
              <span className="block text-sm font-semibold text-[#2A140B]">Produk Unggulan</span>
              <span className="block text-[11px] text-[#5E3622]/70">
                Tampil di urutan populer / diberi label istimewa.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={featured}
              onClick={() => setFeatured((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                featured ? 'bg-[#B87932]' : 'bg-[#EAE2D5]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  featured ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </label>
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#2A140B]/8 bg-white flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="admin-product-form"
            className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#2A140B] hover:bg-[#3A1F14] shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#C58B47]" />
            <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};