'use client';

import React, { useRef, useState } from 'react';
import {
  ArchiveRestore,
  CheckCircle2,
  Download,
  FileJson,
  HardDriveDownload,
  History,
  Info,
  Package,
  RotateCcw,
  Trash2,
  Upload,
  Wallet,
} from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../data/products';
import { formatDateTime } from '../../lib/format';
import {
  BackupHistoryEntry,
  CatalogBackup,
  addBackupHistoryEntry,
  backupFileName,
  backupTotalValue,
  downloadBackup,
  loadBackupHistory,
  parseBackupText,
  removeBackupHistoryEntry,
} from '../../lib/catalogBackup';
import { DualConfirmModal } from './DualConfirmModal';
import { useProducts } from '../../context/ProductsProvider';

interface BackupPanelProps {
  products: Product[];
  adminUser: string;
  onToast: (message: string) => void;
}

interface PendingRestore {
  backup: CatalogBackup;
  products: Product[];
  fileName: string;
}

export const BackupPanel: React.FC<BackupPanelProps> = ({
  products,
  adminUser,
  onToast,
}) => {
  const { save } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<BackupHistoryEntry[]>(() =>
    loadBackupHistory()
  );
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState<PendingRestore | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const handleCreate = () => {
    if (creating) return;
    setCreating(true);
    setTimeout(() => {
      try {
        const data = downloadBackup(products, adminUser);
        const entry: BackupHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: data.createdAt,
          fileName: backupFileName(new Date(data.createdAt)),
          productCount: data.products.length,
          totalValue: backupTotalValue(data.products),
          data,
        };
        addBackupHistoryEntry(entry);
        setHistory(loadBackupHistory());
        onToast('Cadangan katalog berhasil dibuat & diunduh.');
      } catch (err) {
        onToast(
          `Gagal membuat cadangan: ${err instanceof Error ? err.message : 'unknown'}`
        );
      } finally {
        setCreating(false);
      }
    }, 60);
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setParseError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { data, products: parsed } = parseBackupText(
          String(reader.result ?? '')
        );
        setPending({ backup: data, products: parsed, fileName: file.name });
        setConfirming(false);
      } catch (err) {
        setParseError(
          err instanceof Error ? err.message : 'Berkas cadangan tidak valid.'
        );
      }
    };
    reader.onerror = () =>
      setParseError('Gagal membaca berkas cadangan di peramban ini.');
    reader.readAsText(file);
  };

  const handleRestore = async () => {
    if (!pending || restoring) return;
    setRestoring(true);
    try {
      const ok = await save(pending.products);
      if (ok) {
        onToast(
          `Katalog dipulihkan dari "${pending.fileName}" (${pending.products.length} produk).`
        );
      } else {
        onToast('Pemulihan hanya di peramban — gagal menulis ke Supabase.');
      }
    } finally {
      setRestoring(false);
      setPending(null);
      setConfirming(false);
    }
  };

  const restoreEntry = (entry: BackupHistoryEntry) => {
    setPending({
      backup: entry.data,
      products: entry.data.products,
      fileName: entry.fileName,
    });
    setConfirming(false);
  };

  const redownloadEntry = (entry: BackupHistoryEntry) => {
    try {
      downloadBackup(entry.data.products, entry.data.createdBy || adminUser);
      onToast(`Mengunduh ulang "${entry.fileName}".`);
    } catch (err) {
      onToast(
        `Gagal mengunduh: ${err instanceof Error ? err.message : 'unknown'}`
      );
    }
  };

  const deleteEntry = (id: string) => {
    removeBackupHistoryEntry(id);
    setHistory(loadBackupHistory());
    setActiveHistoryId(null);
    onToast('Rekaman cadangan dihapus dari riwayat peramban ini.');
  };

  const totalValue = backupTotalValue(products);

  return (
    <div className="max-w-screen-lg space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE2] text-[#5E3622] text-[10px] font-semibold tracking-[0.18em] uppercase border border-[#2A140B]/6 mb-3">
            <ArchiveRestore className="w-3 h-3 text-[#B87932]" />
            Cadangan & Pemulihan
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A140B]">
            Lindungi data katalog toko
          </h2>
          <p className="mt-1 text-sm text-[#5E3622]/70 max-w-2xl">
            Buat berkas cadangan seluruh katalog (produk + kategori) ke file
            JSON, lalu pulihkan kapan pun — misalnya setelah reset atau saat
            memindahkan data antar perangkat.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#2A140B] hover:bg-[#3A1F14] shadow-xs transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {creating ? (
            <span className="w-4 h-4 rounded-full border-2 border-[#B87932]/40 border-t-[#C58B47] animate-spin" />
          ) : (
            <HardDriveDownload className="w-4 h-4 text-[#C58B47]" />
          )}
          <span>{creating ? 'Membuat…' : 'Buat Cadangan Sekarang'}</span>
        </button>
      </section>

      {/* Stat ringkas */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <MiniStat label="Produk saat ini" value={String(products.length)} icon={<Package className="w-4 h-4" />} />
        <MiniStat label="Nilai katalog" value={formatRupiah(totalValue)} icon={<Wallet className="w-4 h-4" />} />
        <MiniStat label="Di riwayat" value={String(history.length)} icon={<History className="w-4 h-4" />} />
        <MiniStat
          label="Cadangan terakhir"
          value={history[0] ? formatDateTime(history[0].createdAt) : 'Belum ada'}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
      </section>

      {/* Buat & Pulihkan */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Card buat cadangan */}
        <div className="bg-white rounded-2xl border border-[#2A140B]/10 shadow-xs p-5 sm:p-6">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#B87932]/10 text-[#B87932] flex-shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#2A140B]">
                Buat Cadangan
              </h3>
              <p className="text-xs text-[#5E3622]/70 mt-0.5">
                Unduh seluruh katalog sebagai berkas JSON yang dapat disimpan
                di mana saja.
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-[#5E3622] mb-5">
            {[
              `${products.length} produk lengkap (nama, harga, kategori, gambar, deskripsi)`,
              '6 kategori katalog',
              'Metadata waktu pembuatan & pembuat',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B87932] mt-0.5 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full inline-flex items-center justify-center gap-2 min-h-[42px] rounded-xl text-xs font-semibold text-white bg-[#2A140B] hover:bg-[#3A1F14] transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#C58B47]" />
            Unduh Cadangan (JSON)
          </button>
        </div>

        {/* Card pulihkan */}
        <div className="bg-white rounded-2xl border border-[#2A140B]/10 shadow-xs p-5 sm:p-6">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#255A3C]/10 text-[#255A3C] flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#2A140B]">
                Pulihkan Katalog
              </h3>
              <p className="text-xs text-[#5E3622]/70 mt-0.5">
                Muat berkas cadangan untuk mengganti seluruh katalog dengan
                isi cadangan tersebut.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFilePicked}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={restoring}
            className="w-full inline-flex items-center justify-center gap-2 min-h-[42px] rounded-xl text-xs font-semibold text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer disabled:opacity-60"
          >
            <Upload className="w-4 h-4 text-[#B87932]" />
            Pilih Berkas Cadangan…
          </button>

          {parseError && (
            <p
              role="alert"
              className="mt-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5"
            >
              {parseError}
            </p>
          )}

          {pending && (
            <div className="mt-4 rounded-xl border border-[#B87932]/25 bg-[#FAF7F2] p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5E3622]/60 mb-2">
                <FileJson className="w-3.5 h-3.5" />
                Pratinjau cadangan
              </p>
              <p className="text-xs font-semibold text-[#2A140B] break-all mb-1">
                {pending.fileName}
              </p>
              <p className="text-[11px] text-[#5E3622]/70 mb-3">
                Dibuat{' '}
                {pending.backup.createdAt
                  ? formatDateTime(pending.backup.createdAt)
                  : '(tanpa tanggal)'}{' '}
                oleh {pending.backup.createdBy || 'admin'} · format v
                {pending.backup.version}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-white border border-[#2A140B]/10 text-[#2A140B] font-semibold">
                  {pending.products.length} produk
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white border border-[#2A140B]/10 text-[#2A140B] font-semibold">
                  {formatRupiah(backupTotalValue(pending.products))}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white border border-[#2A140B]/10 text-[#2A140B]">
                  {new Set(pending.products.map((p) => p.category)).size} kategori
                </span>
              </div>

              <div className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  onClick={() => {
                    setPending(null);
                    setConfirming(false);
                  }}
                  disabled={restoring}
                  className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-medium text-[#2A140B] bg-white border border-[#2A140B]/10 hover:bg-[#F3ECE2] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => setConfirming(true)}
                  disabled={restoring}
                  className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#255A3C] hover:bg-[#1F4B31] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {restoring ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  {restoring ? 'Memulihkan…' : 'Pulihkan Katalog Ini'}
                </button>
              </div>
              <div className="mt-2.5 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#5E3622]/60 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-[#5E3622]/70 leading-relaxed">
                  Pemulihan mengganti seluruh isi katalog di Supabase dengan
                  data cadangan dan bersifat permanen.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Riwayat */}
      <section className="bg-white rounded-2xl border border-[#2A140B]/10 shadow-xs overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-[#2A140B]/8 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-base font-bold text-[#2A140B]">
              Riwayat Cadangan
            </h3>
            <p className="text-xs text-[#5E3622]/70 mt-0.5">
              Tersimpan di peramban ini (hingga 20 entri terbaru). Klik unduh
              untuk menyimpan lagi, atau pulihkan langsung.
            </p>
          </div>
          {history.length > 0 && (
            <span className="text-[11px] text-[#5E3622]/70 whitespace-nowrap">
              {history.length} cadangan
            </span>
          )}
        </div>

        {history.length > 0 ? (
          <ul className="divide-y divide-[#2A140B]/6">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2A140B] truncate">
                    {entry.fileName}
                  </p>
                  <p className="text-[11px] text-[#5E3622]/70 mt-0.5">
                    {formatDateTime(entry.createdAt)} · {entry.productCount} produk ·{' '}
                    {formatRupiah(entry.totalValue)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => redownloadEntry(entry)}
                    title="Unduh ulang berkas cadangan"
                    className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#5E3622] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh
                  </button>
                  <button
                    onClick={() => restoreEntry(entry)}
                    title="Pulihkan katalog dari cadangan ini"
                    className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#255A3C] hover:bg-[#1F4B31] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Pulihkan
                  </button>
                  <button
                    onClick={() => setActiveHistoryId(entry.id)}
                    title="Hapus rekaman dari riwayat"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-14 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-[#F3ECE2] text-[#5E3622]/50 flex items-center justify-center mb-3">
              <History className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#2A140B] mb-1">
              Belum ada cadangan
            </p>
            <p className="text-xs text-[#5E3622]/70">
              Buat cadangan pertama Anda dengan menekan "Buat Cadangan Sekarang".
            </p>
          </div>
        )}
      </section>

      {/* Konfirmasi pemulihan */}
      <DualConfirmModal
        open={!!pending && confirming}
        title="Pulihkan Katalog dari Cadangan"
        description={
          <>
            Seluruh katalog saat ini akan{' '}
            <strong className="text-[#2A140B]">
              diganti {pending ? `oleh ${pending.products.length} produk` : ''}{' '}
            </strong>
            dari cadangan. Perubahan ini permanen di Supabase.
          </>
        }
        confirmLabel="Pulihkan"
        onConfirm={handleRestore}
        onCancel={() => {
          if (restoring) return;
          setConfirming(false);
        }}
      />

      {/* Konfirmasi hapus riwayat */}
      <DualConfirmModal
        open={!!activeHistoryId}
        title="Hapus Rekaman Cadangan"
        description="Rekaman ini akan dihapus dari riwayat peramban ini. Berkas cadangan yang sudah Anda unduh tetap aman di perangkat Anda."
        confirmLabel="Hapus Rekaman"
        onConfirm={() => activeHistoryId && deleteEntry(activeHistoryId)}
        onCancel={() => setActiveHistoryId(null)}
      />
    </div>
  );
};

const MiniStat: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="bg-white rounded-2xl border border-[#2A140B]/10 p-4 shadow-xs">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#F3ECE2] text-[#B87932] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5E3622]/70 truncate">
          {label}
        </p>
        <p
          className="font-serif font-bold text-sm sm:text-base text-[#2A140B] truncate"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);