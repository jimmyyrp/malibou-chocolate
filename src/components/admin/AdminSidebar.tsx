'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArchiveRestore,
  ArrowUpRight,
  ImageOff,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import { MalibouLogo } from '../MalibouLogo';

export type AdminView = 'dashboard' | 'products' | 'backup' | 'storage';

interface AdminSidebarProps {
  view: AdminView;
  open: boolean;
  onClose: () => void;
  onNavigate: (view: AdminView) => void;
  onLogout: () => void;
  adminUser: string;
  totalProducts: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  view,
  open,
  onClose,
  onNavigate,
  onLogout,
  adminUser,
  totalProducts,
}) => {
  const handleNavigate = (v: AdminView) => {
    onNavigate(v);
    onClose();
  };

  const body = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center justify-between gap-2 h-16 sm:h-[72px] px-5 border-b border-[#2A140B]/8 flex-shrink-0">
        <MalibouLogo size="sm" hideSubOnMobile />
        <button
          onClick={onClose}
          aria-label="Tutup menu"
          className="lg:hidden p-1.5 rounded-lg text-[#5E3622] hover:text-[#2A140B] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5E3622]/50">
          Menu Utama
        </p>
        <SidebarNavItem
          active={view === 'dashboard'}
          onClick={() => handleNavigate('dashboard')}
          icon={<LayoutDashboard className="w-4 h-4" />}
          label="Dashboard"
        />
        <SidebarNavItem
          active={view === 'products'}
          onClick={() => handleNavigate('products')}
          icon={<Package className="w-4 h-4" />}
          label="Produk"
          badge={String(totalProducts)}
        />
        <p className="px-3 mt-5 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5E3622]/50">
          Pemeliharaan
        </p>
        <SidebarNavItem
          active={view === 'backup'}
          onClick={() => handleNavigate('backup')}
          icon={<ArchiveRestore className="w-4 h-4" />}
          label="Cadangan & Pemulihan"
        />
        <SidebarNavItem
          active={view === 'storage'}
          onClick={() => handleNavigate('storage')}
          icon={<ImageOff className="w-4 h-4" />}
          label="Gambar Yatim"
        />
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-4 border-t border-[#2A140B]/8 space-y-2.5 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#F3ECE2]/70">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#B87932]/15 text-[#B87932] flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#2A140B] truncate">
              {adminUser || 'Admin'}
            </p>
            <p className="text-[10px] text-[#5E3622]/60">Administrator</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-[#5E3622] hover:text-[#2A140B] hover:bg-[#F3ECE2] transition-colors"
        >
          <Store className="w-4 h-4 text-[#B87932]" />
          <span>Lihat Toko</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-[#5E3622]/50" />
        </Link>

        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-red-700 hover:text-white hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#2A140B]/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[#FAF7F2] shadow-2xl">
            {body}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-[#FAF7F2] border-r border-[#2A140B]/8 z-40">
        {body}
      </aside>
    </>
  );
};

const SidebarNavItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
      active
        ? 'text-[#2A140B] bg-[#F3ECE2] ring-1 ring-[#B87932]/25'
        : 'text-[#5E3622]/70 hover:text-[#2A140B] hover:bg-[#F3ECE2]/70'
    }`}
  >
    <span className={active ? 'text-[#B87932]' : 'text-[#B87932]/70'}>{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    {badge !== undefined && (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          active ? 'bg-[#B87932]/15 text-[#7E4A30]' : 'bg-[#F3ECE2] text-[#5E3622]/60'
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);