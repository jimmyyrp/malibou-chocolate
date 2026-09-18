'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, Loader2, Check, Pencil } from 'lucide-react';
import { Product } from '../../types';
import { productImages } from '../../lib/productImages';
import { toSafeImageUrl } from '../../lib/supabase';
import { downloadImage, DownloadResult } from '../../lib/imageDownload';
import { imageOnError } from '../../lib/imageFallback';
import { lockBodyScroll, unlockBodyScroll } from '../../lib/scrollLock';

interface ProductImagesPreviewModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onEdit?: (product: Product) => void;
}

/**
 * Pratinjau galeri foto produk di dashboard: menampilkan seluruh foto
 * produk (maks. 3) dengan tummbnail yang bisa diklik, buka di tab baru,
 * dan unduh per foto. Berguna sebelum mengunduh / mengecek hasil edit.
 */
export const ProductImagesPreviewModal: React.FC<ProductImagesPreviewModalProps> = ({
  open,
  product,
  onClose,
  onEdit,
}) => {
  const images = product ? productImages(product) : [];
  const [active, setActive] = useState(0);
  const [dl, setDl] = useState<{ index: number; result: DownloadResult | 'busy' } | null>(null);
  const dlTimerRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setActive(0);
      setDl(null);
    }
  }, [open, product?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % Math.max(1, images.length));
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % Math.max(1, images.length));
    };
    window.addEventListener('keydown', onKey);
    lockBodyScroll();
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockBodyScroll();
      if (dlTimerRef.current) window.clearTimeout(dlTimerRef.current);
    };
  }, [open, images.length, onClose]);

  if (!open || !product || images.length === 0) return null;

  const safeActive = Math.min(active, images.length - 1);
  const activeUrl = toSafeImageUrl(images[safeActive]);

  const handleDownload = async (index: number) => {
    if (dl?.result === 'busy') return;
    setDl({ index, result: 'busy' });
    const result = await downloadImage(toSafeImageUrl(images[index]));
    setDl({ index, result });
    if (dlTimerRef.current) window.clearTimeout(dlTimerRef.current);
    dlTimerRef.current = window.setTimeout(() => setDl(null), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-[admin-fade-in_0.15s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-images-preview-title"
    >
      <div className="absolute inset-0 bg-[#1C0D06]/60 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full sm:max-w-xl max-h-[92vh] sm:max-h-[90vh] bg-[#FAF7F2] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#2A140B]/10 flex flex-col overflow-hidden animate-[admin-pop-in_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A140B]/8 bg-white">
          <div className="min-w-0">
            <h2
              id="product-images-preview-title"
              className="font-serif text-base font-bold text-[#2A140B] truncate"
            >
              {product.name}
            </h2>
            <p className="text-[11px] text-[#5E3622]/70">
              Foto produk · {images.length} gambar
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup pratinjau"
            className="p-2 rounded-lg text-[#5E3622]/60 hover:text-[#2A140B] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main preview */}
        <div className="px-5 pt-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#241105]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeUrl}
              alt={`${images.length > 1 ? `Foto ${safeActive + 1} ` : ''}${product.name}`}
              onError={imageOnError}
              className="w-full h-full object-contain"
            />
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white bg-[#170904]/60 backdrop-blur-[2px]">
              {safeActive === 0 ? 'Foto Utama' : `Foto ${safeActive + 1}`} · {safeActive + 1}/{images.length}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 p-2.5 bg-gradient-to-t from-[#170904]/70 to-transparent">
              <button
                type="button"
                onClick={() => handleDownload(safeActive)}
                disabled={dl?.result === 'busy'}
                title="Unduh gambar ini"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                {dl?.result === 'busy' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C58B47]" />
                ) : dl?.result === 'ok' ? (
                  <Check className="w-3.5 h-3.5 text-green-300" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>
                  {dl?.result === 'busy'
                    ? 'Mengunduh…'
                    : dl?.result === 'ok'
                      ? 'Tersimpan'
                      : 'Unduh'}
                </span>
              </button>
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka gambar di tab baru"
                className="p-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="px-5 py-3.5 grid grid-cols-3 gap-2.5">
            {images.map((img, i) => (
              <button
                key={`${product.id}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Tampilkan foto ${i + 1} dari ${images.length}`}
                className={`relative aspect-square rounded-lg overflow-hidden bg-[#F3ECE2] border-2 transition-colors cursor-pointer ${
                  safeActive === i
                    ? 'border-[#B87932] ring-1 ring-[#B87932]/40'
                    : 'border-[#2A140B]/10 hover:border-[#B87932]/40'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={toSafeImageUrl(img)}
                  alt={`Foto ${i + 1} ${product.name}`}
                  onError={imageOnError}
                  className="w-full h-full object-cover"
                />
                {safeActive === i && (
                  <span className="absolute inset-0 bg-[#B87932]/10 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#2A140B]/8 bg-white flex items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
          >
            Tutup
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#2A140B] hover:bg-[#3A1F14] shadow-xs transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-[#C58B47]" />
              Edit Foto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};