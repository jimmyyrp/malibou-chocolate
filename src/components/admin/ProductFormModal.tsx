'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  ImagePlus,
  Check,
  Upload,
  Loader2,
  Pencil,
  ExternalLink,
  Download,
  Trash2,
  Star,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { CATEGORIES, formatRupiah } from '../../data/products';
import { nextProductId } from '../../data/productsStore';
import { useProducts } from '../../context/ProductsProvider';
import { ImageEditorModal } from './ImageEditorModal';
import { DualConfirmModal } from './DualConfirmModal';
import { MAX_PRODUCT_IMAGES } from '../../lib/productImages';
import { lockBodyScroll, unlockBodyScroll } from '../../lib/scrollLock';
import {
  PRODUCT_IMAGES_BUCKET,
  toSafeImageUrl,
} from '../../lib/supabase';
import {
  downloadImage,
  DownloadResult,
  isOpenableUrl,
} from '../../lib/imageDownload';

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

type ConfirmAction = { type: 'replace' | 'remove'; slot: number };
type DownloadState = { slot: number; result: DownloadResult | 'busy' } | null;

const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as ProductCategory[];

const UNIT_OPTIONS = ['pcs', 'pouch', 'box', 'botol', 'pack', 'renteng', 'gram', 'sachet'];

function urlValid(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith('data:') || v.startsWith('blob:')) return true;
  try {
    const url = new URL(v);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function emptySlots(): string[] {
  return new Array(MAX_PRODUCT_IMAGES).fill('');
}

/** Ambil value produk sebagai slot berpola tetap (maks. 3, sisanya kosong). */
function slotsFromProduct(product: Product | null): string[] {
  if (!product) return emptySlots();
  const base =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const slots = emptySlots();
  base.slice(0, MAX_PRODUCT_IMAGES).forEach((v, i) => {
    slots[i] = (v || '').trim();
  });
  return slots;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  product,
  defaultCategory,
  onClose,
  onSave,
}) => {
  const { products } = useProducts();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>(defaultCategory);
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [slots, setSlots] = useState<string[]>(emptySlots());
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slotRef = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const editorObjUrlRef = useRef<string | null>(null);
  const pendingEditRef = useRef<{ slot: number; src: string; ownsUrl: boolean } | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [downloadState, setDownloadState] = useState<DownloadState>(null);
  const downloadTimerRef = useRef<number | null>(null);

  const isEdit = !!product;

  useEffect(() => {
    if (!open) return;
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(String(product.price));
      setWeight(product.weight || '');
      setUnit(product.unit || 'pcs');
      setDescription(product.description);
      setFeatured(!!product.featured);
    } else {
      setName('');
      setCategory(defaultCategory);
      setPrice('');
      setWeight('');
      setUnit('pcs');
      setDescription('');
      setFeatured(false);
    }
    setSlots(slotsFromProduct(product));
    setErrors({});
    setUploadError(null);
    setConfirmAction(null);
    setDownloadState(null);
  }, [open, product, defaultCategory]);

  const editorActive = !!editorSrc;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !editorActive && !confirmAction) onClose();
    };
    window.addEventListener('keydown', onKey);
    lockBodyScroll();
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockBodyScroll();
    };
  }, [open, onClose, editorActive, confirmAction]);

  const priceNumber = useMemo(() => {
    const n = parseInt(price.replace(/\D/g, ''), 10) || 0;
    return n;
  }, [price]);

  const setSlotValue = (index: number, value: string) => {
    setSlots((prev) => {
      const next = prev.slice(0, MAX_PRODUCT_IMAGES);
      while (next.length <= index) next.push('');
      next[index] = value.trim();
      return next;
    });
  };

  const replaceSlotValue = (index: number, value: string) => {
    setSlots((prev) => {
      const next = prev.slice(0, MAX_PRODUCT_IMAGES);
      while (next.length <= index) next.push('');
      next[index] = value.trim();
      return next;
    });
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => {
      const compact = prev
        .map((v) => v.trim())
        .filter(Boolean)
        .filter((_, i) => i !== index);
      const next = emptySlots();
      compact.slice(0, MAX_PRODUCT_IMAGES).forEach((v, i) => {
        next[i] = v;
      });
      return next;
    });
  };

  const setAsCover = (index: number) => {
    if (index <= 0) return;
    setSlots((prev) => {
      const next = prev.slice(0, MAX_PRODUCT_IMAGES);
      if (!next[index]?.trim()) return prev;
      [next[0], next[index]] = [next[index], next[0]];
      return next;
    });
  };

  const beginPendingEdit = () => {
    const pending = pendingEditRef.current;
    if (!pending) return;
    if (pending.ownsUrl) {
      if (editorObjUrlRef.current) URL.revokeObjectURL(editorObjUrlRef.current);
      editorObjUrlRef.current = pending.src;
    }
    slotRef.current = pending.slot;
    pendingEditRef.current = null;
    setConfirmAction(null);
    setUploadError(null);
    setEditorSrc(pending.src);
  };

  const cancelConfirm = () => {
    if (pendingEditRef.current?.ownsUrl && pendingEditRef.current.src) {
      URL.revokeObjectURL(pendingEditRef.current.src);
    }
    pendingEditRef.current = null;
    setConfirmAction(null);
  };

  const handlePickClick = (slot: number) => {
    slotRef.current = slot;
    fileInputRef.current?.click();
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (jpeg/png/webp/gif/avif).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran berkas melebihi 5 MB. Pilih gambar yang lebih kecil lalu coba lagi.');
      return;
    }

    let objectUrl: string;
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      setUploadError('Gagal membaca berkas di peramban ini. Coba gambar lain.');
      return;
    }

    const slot = slotRef.current;
    slotRef.current = 0;

    // Slot sudah berisi foto -> konfirmasi dua langkah sebelum mengganti.
    if (slots[slot]?.trim()) {
      pendingEditRef.current = { slot, src: objectUrl, ownsUrl: true };
      setConfirmAction({ type: 'replace', slot });
      return;
    }

    if (editorObjUrlRef.current) URL.revokeObjectURL(editorObjUrlRef.current);
    editorObjUrlRef.current = objectUrl;
    setUploadError(null);
    setEditorSrc(objectUrl);
  };

  const handleEditExisting = (slot: number) => {
    const value = slots[slot]?.trim();
    if (!value || !urlValid(value)) return;
    pendingEditRef.current = { slot, src: toSafeImageUrl(value), ownsUrl: false };
    setConfirmAction({ type: 'replace', slot });
  };

  const handleRemoveSlot = (slot: number) => {
    setConfirmAction({ type: 'remove', slot });
  };

  const confirmRemoveApplied = () => {
    if (!confirmAction) return;
    removeSlot(confirmAction.slot);
    setConfirmAction(null);
  };

  const closeEditor = () => {
    if (editorObjUrlRef.current) {
      URL.revokeObjectURL(editorObjUrlRef.current);
      editorObjUrlRef.current = null;
    }
    slotRef.current = 0;
    setEditorSrc(null);
  };

  const handleEditorApply = async (
    dataUrl: string,
    _dims: { width: number; height: number }
  ) => {
    const slot = slotRef.current;
    setUploading(true);
    setUploadError(null);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const cleanName = (name.trim() || 'produk')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .toLowerCase()
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
      const isPng = dataUrl.startsWith('data:image/png');
      const ext = isPng ? 'png' : 'jpg';
      const path = `products/${cleanName}-${Date.now()}.${ext}`;

      const form = new FormData();
      form.append('file', blob, path);
      form.append('path', path);
      form.append('upsert', '1');

      let res: Response;
      try {
        res = await fetch('/api/admin/storage', {
          method: 'POST',
          body: form,
        });
      } catch {
        // Server tidak terjangkau — simpan gambar hanya di peramban ini.
        replaceSlotValue(slot, dataUrl);
        setUploadError(
          'Koneksi ke server gagal — gambar hanya disimpan di peramban ini dan TIDAK akan tampil di toko online.'
        );
        closeEditor();
        return;
      }

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (body && typeof body.error === 'string' && body.error) ||
            `Gagal mengunggah (HTTP ${res.status})`
        );
      }
      replaceSlotValue(slot, toSafeImageUrl(path));
    } catch (err) {
      setUploadError(
        err instanceof Error && err.message
          ? err.message
          : 'Gagal mengunggah gambar ke bucket.'
      );
    } finally {
      setUploading(false);
      closeEditor();
    }
  };

  useEffect(() => {
    return () => {
      if (downloadTimerRef.current) window.clearTimeout(downloadTimerRef.current);
    };
  }, []);

  const handleDownloadSlot = async (slot: number) => {
    const value = slots[slot]?.trim();
    if (!value || downloadState?.result === 'busy') return;
    setDownloadState({ slot, result: 'busy' });
    const result = await downloadImage(toSafeImageUrl(value));
    setDownloadState({ slot, result });
    if (downloadTimerRef.current) window.clearTimeout(downloadTimerRef.current);
    downloadTimerRef.current = window.setTimeout(() => setDownloadState(null), 2200);
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

    const filled = slots.map((v) => v.trim()).filter(Boolean);
    if (filled.length === 0) {
      nextErrors.imageUrl = 'Tambahkan minimal 1 gambar produk (unggah file atau isi URL foto utama).';
    } else if (filled.some((v) => !urlValid(v))) {
      nextErrors.imageUrl = 'URL gambar harus diawali http:// atau https:// (atau data:/blob: untuk unggahan lokal).';
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

    const filled = slots
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, MAX_PRODUCT_IMAGES)
      .map((v) => toSafeImageUrl(v));

    const categoryValue = CATEGORY_IDS.includes(category) ? category : 'chocolate-bar';
    const categoryName =
      CATEGORIES.find((c) => c.id === categoryValue)?.name || 'Coklat Batangan';

    const next: Product = {
      id: product ? product.id : nextProductId(products),
      name: name.trim(),
      category: categoryValue,
      categoryName,
      price: priceNumber,
      unit: unit.trim() || 'pcs',
      weight: weight.trim() || undefined,
      description: description.trim(),
      imageUrl: filled[0] || '',
      images: filled,
      featured,
    };
    onSave(next);
  };

  if (!open) return null;

  const fieldBase =
    'w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-[#2A140B] placeholder-[#5E3622]/40 focus:outline-none focus-visible:ring-2 transition-colors';
  const fieldOk = `${fieldBase} border-[#2A140B]/10 focus-visible:ring-[#B87932] focus:border-[#B87932]`;
  const fieldErr = `${fieldBase} border-red-400 focus-visible:ring-red-300`;

  const filledCount = slots.filter((v) => v.trim()).length;
  const maxReached = filledCount >= MAX_PRODUCT_IMAGES;

  const renderSlotActions = (slot: number, value: string) => {
    const safeUrl = toSafeImageUrl(value);
    const openable = isOpenableUrl(value);
    return (
      <div className="flex items-center justify-between gap-1 p-1.5 bg-[#170904]/60 backdrop-blur-[2px]">
        <button
          type="button"
          onClick={() => handlePickClick(slot)}
          disabled={uploading}
          title={value.trim() ? 'Ganti foto (unggah file baru)' : 'Unggah / pilih file'}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          {value.trim() ? 'Ganti' : 'Unggah'}
        </button>
        <button
          type="button"
          onClick={() => handleEditExisting(slot)}
          disabled={!urlValid(value) || uploading}
          title="Edit foto (crop / putar / resize)"
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-40"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
        <div className="flex items-center gap-0.5">
          {openable && (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Buka gambar di tab baru"
              className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            type="button"
            onClick={() => handleDownloadSlot(slot)}
            disabled={!openable || downloadState?.result === 'busy'}
            title={
              downloadState?.slot === slot && downloadState.result === 'busy'
                ? 'Mengunduh gambar…'
                : downloadState?.slot === slot && downloadState.result === 'ok'
                  ? 'Gambar berhasil diunduh'
                  : downloadState?.slot === slot && downloadState.result === 'tab'
                    ? 'Dibuka di tab baru (blokir CORS)'
                    : 'Unduh gambar'
            }
            className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-40"
          >
            {downloadState?.slot === slot && downloadState.result === 'busy' ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#C58B47]" />
            ) : downloadState?.slot === slot && downloadState.result === 'ok' ? (
              <Check className="w-3 h-3 text-green-300" />
            ) : downloadState?.slot === slot && downloadState.result === 'tab' ? (
              <ExternalLink className="w-3 h-3 text-[#C58B47]" />
            ) : (
              <Download className="w-3 h-3" />
            )}
          </button>
          {slot > 0 && (
            <button
              type="button"
              onClick={() => setAsCover(slot)}
              title="Jadikan foto utama"
              className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Star className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleRemoveSlot(slot)}
            disabled={filledCount <= 1}
            title={filledCount <= 1 ? 'Produk wajib punya minimal 1 foto' : 'Hapus gambar'}
            className="p-1.5 rounded-lg text-red-200 hover:bg-red-600/60 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

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
      />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] bg-[#FAF7F2] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#2A140B]/10 flex flex-col overflow-hidden animate-[admin-pop-in_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A140B]/8 bg-white">
          <div>
            <h2 id="product-form-title" className="font-serif text-lg font-bold text-[#2A140B]">
              {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h2>
            <p className="text-[11px] text-[#5E3622]/70">
              Lengkapi detail produk di bawah ini.
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
          <div>
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
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="pf-image" className="block text-xs font-semibold text-[#5E3622]">
                Gambar Produk <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-[#B87932]">
                {filledCount}/{MAX_PRODUCT_IMAGES} foto
              </span>
            </div>

            {/* URL Foto Utama */}
            <input
              id="pf-image"
              type="url"
              value={slots[0] ?? ''}
              onChange={(e) => setSlotValue(0, e.target.value)}
              placeholder="URL foto utama (atau path bucket, mis. products/cb-070.jpg)"
              className={errors.imageUrl ? fieldErr : fieldOk}
            />

            {/* Slot Galeri */}
            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              {[0, 1, 2].map((slot) => {
                const value = (slots[slot] ?? '').trim();
                if (value) {
                  const safeUrl = toSafeImageUrl(value);
                  const isCover = slot === 0;
                  return (
                    <div
                      key={slot}
                      className={`relative aspect-square rounded-xl overflow-hidden bg-white border ${
                        isCover
                          ? 'border-[#B87932]/60 ring-1 ring-[#B87932]/30'
                          : 'border-[#2A140B]/10'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={safeUrl}
                        alt={`${isCover ? 'Foto utama' : `Foto ${slot + 1}`} produk`}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold ${
                          isCover
                            ? 'bg-[#B87932] text-white'
                            : 'bg-[#170904]/60 text-white/90'
                        }`}
                      >
                        {isCover ? 'Utama' : `Foto ${slot + 1}`}
                      </span>
                      <div className="absolute inset-x-0 bottom-0">
                        {renderSlotActions(slot, value)}
                      </div>
                    </div>
                  );
                }
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handlePickClick(slot)}
                    disabled={uploading}
                    title="Tambahkan foto produk"
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-[#5E3622]/60 hover:text-[#B87932] hover:border-[#B87932]/50 hover:bg-[#FAF7F2] transition-colors cursor-pointer ${
                      slot === 0
                        ? 'border-[#2A140B]/25'
                        : 'border-[#2A140B]/15'
                    }`}
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-[9px] font-semibold">Tambah Foto</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFilePicked}
              />
              {slots[0] && !slots[0].startsWith('data:') && (
                <span className="text-[11px] text-[#5E3622]/60">
                  Tersimpan di bucket{' '}
                  <code className="text-[#B87932]">{PRODUCT_IMAGES_BUCKET}</code>
                </span>
              )}
              {maxReached && (
                <span className="text-[11px] text-[#B87932] font-medium">
                  Maksimal {MAX_PRODUCT_IMAGES} foto per produk.
                </span>
              )}
            </div>

            <p className="mt-2 text-[11px] text-[#5E3622]/60">
              Foto utama tampil sebagai sampul. File yang dipilih otomatis dibuka di{' '}
              <strong className="text-[#2A140B]">canvas editor</strong> (crop, putar,
              ubah ukuran) lalu disimpan. Mengganti atau menghapus foto diminta{' '}
              <strong className="text-[#2A140B]">konfirmasi dua langkah</strong>.
            </p>
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

      <ImageEditorModal
        open={!!editorSrc}
        src={editorSrc ?? ''}
        sourceLabel={name.trim() || 'gambar produk'}
        onClose={closeEditor}
        onApply={handleEditorApply}
      />

      <DualConfirmModal
        open={confirmAction !== null}
        title={
          confirmAction?.type === 'remove'
            ? 'Hapus gambar produk?'
            : 'Ganti foto produk?'
        }
        description={
          confirmAction?.type === 'remove'
            ? 'Foto ini akan dihapus dari galeri produk dan posisi foto lain otomatis menyesuaikan. Perubahan baru benar-benar diterapkan setelah Anda menekan tombol Simpan.'
            : 'Foto baru akan menggantikan gambar di posisi ini dan dibuka di canvas editor (crop, putar, ukuran) untuk disesuaikan lebih dulu sebelum disimpan. Perubahan diterapkan setelah Anda menekan tombol Simpan.'
        }
        confirmLabel={
          confirmAction?.type === 'remove' ? 'Hapus Gambar' : 'Ganti Gambar'
        }
        accentDanger={confirmAction?.type === 'remove'}
        onConfirm={confirmAction?.type === 'remove' ? confirmRemoveApplied : beginPendingEdit}
        onCancel={cancelConfirm}
      />

      </div>
  );
};