'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Star, Store, Trash2 } from 'lucide-react';
import { Product } from '../../types';

interface ProductActionMenuProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
}

interface MenuPos {
  top: number;
  left: number;
}

const MENU_WIDTH = 200;
const MENU_HEIGHT = 224;
const GAP = 6;

/**
 * Menu aksi "…" per produk (Edit, Unggulan, Lihat di Toko, Hapus).
 * Diposisikan secara `fixed` memakai rect tombol pemicu sehingga tidak
 * terpotong oleh container tabel yang `overflow-x-auto`.
 */
export const ProductActionMenu: React.FC<ProductActionMenuProps> = ({
  open,
  onOpen,
  onClose,
  product,
  onEdit,
  onDelete,
  onToggleFeatured,
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<MenuPos | null>(null);

  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;
    if (left + MENU_WIDTH > vw - 8) left = Math.max(8, vw - MENU_WIDTH - 8);
    let top = rect.bottom + GAP;
    if (top + MENU_HEIGHT > vh - 8) {
      top = Math.max(8, rect.top - MENU_HEIGHT - GAP);
    }
    setPos({ top, left });
  }, [open, product.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onScroll = () => onClose();
    const onResize = () => onClose();
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, onClose]);

  const name = product.name.trim() || 'Produk';
  const featuredLabel = product.featured
    ? 'Hapus dari Unggulan'
    : 'Jadikan Unggulan';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? onClose() : onOpen())}
        aria-label={`Menu aksi ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5E3622] hover:text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && pos && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            role="menu"
            aria-label={`Menu aksi ${name}`}
            className="fixed z-50 w-[200px] bg-white rounded-xl border border-[#2A140B]/10 shadow-xl py-1.5 animate-[admin-pop-in_0.15s_ease-out]"
            style={{ top: pos.top, left: pos.left }}
          >
            <MenuItem
              icon={<Pencil className="w-4 h-4" />}
              label="Edit Produk"
              onClick={() => {
                onEdit();
                onClose();
              }}
            />
            <MenuItem
              icon={
                <Star
                  className={`w-4 h-4 ${product.featured ? 'fill-current text-[#B87932]' : ''}`}
                />
              }
              label={featuredLabel}
              onClick={() => {
                onToggleFeatured();
                onClose();
              }}
            />
            <Link
              href={`/produk/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={onClose}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-xs font-medium text-[#2A140B] hover:bg-[#F3ECE2] transition-colors"
            >
              <Store className="w-4 h-4 text-[#B87932]" />
              <span>Lihat di Toko</span>
            </Link>
            <div className="my-1.5 h-px bg-[#2A140B]/8" />
            <MenuItem
              danger
              icon={<Trash2 className="w-4 h-4" />}
              label="Hapus Produk"
              onClick={() => {
                onDelete();
                onClose();
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, label, onClick, danger }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`flex items-center gap-2.5 w-full px-3 py-2 text-left text-xs font-medium transition-colors ${
      danger
        ? 'text-red-600 hover:bg-red-50'
        : 'text-[#2A140B] hover:bg-[#F3ECE2]'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);