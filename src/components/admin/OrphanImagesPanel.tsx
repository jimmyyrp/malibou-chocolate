'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  FolderOpen,
  ImageOff,
  RefreshCw,
  Trash2,
  HardDrive,
  FileImage,
  Link2,
  AlertTriangle,
} from 'lucide-react';
import { formatBytes, formatDateTime } from '../../lib/format';
import { imageOnError } from '../../lib/imageFallback';
import { DualConfirmModal } from './DualConfirmModal';

interface StorageResponse {
  ok?: boolean;
  total: number;
  totalSize: number;
  referencedCount: number;
  orphanSize: number;
  orphans: OrphanItem[];
}

interface OrphanItem {
  path: string;
  name: string;
  size: number;
  updatedAt: string | null;
  createdAt: string | null;
  url: string;
}

export const EMPTY_STORAGE: StorageResponse = {
  total: 0,
  totalSize: 0,
  referencedCount: 0,
  orphanSize: 0,
  orphans: [],
};

interface OrphanImagesPanelProps {
  onToast: (message: string) => void;
}

type ConfirmState =
  | { kind: 'orphan'; paths: string[] }
  | { kind: 'all' }
  | null;

export const OrphanImagesPanel: React.FC<OrphanImagesPanelProps> = ({
  onToast,
}) => {
  const [state, setState] = useState<StorageResponse>(EMPTY_STORAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/storage');
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (body && typeof body.error === 'string' && body.error) ||
            `Gagal memuat storage (HTTP ${res.status})`
        );
      }
      setState(body && typeof body === 'object' ? (body as StorageResponse) : EMPTY_STORAGE);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat storage.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removePaths = async (paths: string[], label: string) => {
    if (deleting || paths.length === 0) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/storage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (body && typeof body.error === 'string' && body.error) ||
            `Gagal menghapus (HTTP ${res.status})`
        );
      }
      onToast(`${label} berhasil dihapus dari bucket.`);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus file.');
      onToast(`Gagal menghapus: ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      setDeleting(false);
    }
  };

  const runConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === 'orphan') {
      void removePaths(confirm.paths, `${confirm.paths.length} gambar yatim`);
    } else if (confirm.kind === 'all') {
      void removePaths(
        state.orphans.map((o) => o.path),
        `${state.orphans.length} gambar yatim`
      );
    }
    setConfirm(null);
  };

  const toggleAll = () => {
    setSelected((prev) => {
      if (state.orphans.length > 0 && state.orphans.every((o) => prev.has(o.path))) {
        return new Set();
      }
      return new Set(state.orphans.map((o) => o.path));
    });
  };

  const toggleOne = (path: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const allSelected =
    state.orphans.length > 0 && state.orphans.every((o) => selected.has(o.path));
  const freed = state.orphanSize;

  return (
    <div className="max-w-screen-lg space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE2] text-[#5E3622] text-[10px] font-semibold tracking-[0.18em] uppercase border border-[#2A140B]/6 mb-3">
            <ImageOff className="w-3 h-3 text-[#B87932]" />
            Gambar Yatim (Orphan)
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A140B]">
            Bersihkan gambar yang tidak terpakai
          </h2>
          <p className="mt-1 text-sm text-[#5E3622]/70 max-w-2xl">
            File di bucket <code className="text-[#B87932]">product-images</code>{' '}
            yang tidak lagi direferensikan produk mana pun. Hapus untuk menghemat
            kuota penyimpanan.
          </p>
        </div>
        <button
          onClick={() => load()}
          disabled={loading || deleting}
          className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2.5 rounded-xl text-sm font-semibold text-[#5E3622] bg-white border border-[#2A140B]/10 hover:bg-[#F3ECE2] transition-colors disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#B87932] ${loading ? 'animate-spin' : ''}`} />
          Muat Ulang
        </button>
      </section>

      {/* Stat */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <MiniStat label="Total file di bucket" value={String(state.total)} icon={<FolderOpen className="w-4 h-4" />} />
        <MiniStat label="Gambar yatim" value={String(state.orphans.length)} icon={<FileImage className="w-4 h-4" />} />
        <MiniStat label="Penyimpanan bucket" value={formatBytes(state.totalSize)} icon={<HardDrive className="w-4 h-4" />} />
        <MiniStat label="Gambar terhubung" value={String(state.referencedCount)} icon={<Link2 className="w-4 h-4" />} />
      </section>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Orphan list */}
      <section className="bg-white rounded-2xl border border-[#2A140B]/10 shadow-xs overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-[#2A140B]/8 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-[#2A140B]">
              Daftar Gambar Yatim
            </h3>
            <p className="text-xs text-[#5E3622]/70 mt-0.5">
              {loading
                ? 'Memuat daftar file dari bucket…'
                : state.orphans.length > 0
                  ? `${state.orphans.length} file tidak dipakai · potensi hemat ${formatBytes(freed)}`
                  : 'Tidak ada gambar yatim. Bucket bersih.'}
            </p>
          </div>
          {state.orphans.length > 0 && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleAll}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#5E3622] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <span
                    className={`w-3.5 h-3.5 rounded border ${
                      allSelected
                        ? 'bg-[#B87932] border-[#B87932]'
                        : 'border-[#5E3622]/40 bg-white'
                    }`}
                  />
                </span>
                {allSelected ? 'Batalkan Semua' : 'Pilih Semua'}
              </button>
              <button
                onClick={() => setConfirm({ kind: 'all' })}
                disabled={state.orphans.length === 0 || deleting}
                className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Semua
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#2A140B]/10 border-t-[#B87932] animate-spin" />
            <p className="text-xs text-[#5E3622]/70">Menghitung referensi & memeriksa bucket…</p>
          </div>
        ) : state.orphans.length > 0 ? (
          <>
            <ul className="divide-y divide-[#2A140B]/6 max-h-[560px] overflow-y-auto">
              {state.orphans.map((o) => (
                <li
                  key={o.path}
                  className="px-5 sm:px-6 py-3.5 flex items-center gap-3.5"
                >
                  <button
                    onClick={() => toggleOne(o.path)}
                    aria-label="Pilih gambar"
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <span
                      className={`w-4 h-4 rounded border ${
                        selected.has(o.path)
                          ? 'bg-[#B87932] border-[#B87932]'
                          : 'border-[#5E3622]/40 bg-white'
                      }`}
                    />
                  </button>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F3ECE2] border border-[#2A140B]/8 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={o.url}
                      alt={o.name}
                      onError={imageOnError}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2A140B] truncate">
                      {o.name}
                    </p>
                    <p className="text-[11px] text-[#5E3622]/70 truncate">{o.path}</p>
                    <p className="text-[11px] text-[#5E3622]/60">
                      {formatBytes(o.size)} ·{' '}
                      {o.updatedAt
                        ? `diubah ${formatDateTime(o.updatedAt)}`
                        : 'tanpa tanggal'}
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirm({ kind: 'orphan', paths: [o.path] })}
                    disabled={deleting}
                    title="Hapus gambar ini"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            {selected.size > 0 && (
              <div className="px-5 sm:px-6 py-3 border-t border-[#2A140B]/8 bg-[#FAF7F2] flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#5E3622]">
                  {selected.size} gambar dipilih
                </span>
                <button
                  onClick={() =>
                    setConfirm({
                      kind: 'orphan',
                      paths: Array.from(selected),
                    })
                  }
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Terpilih
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-14 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-[#F3ECE2] text-[#5E3622]/50 flex items-center justify-center mb-3">
              <ImageOff className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#2A140B] mb-1">
              Tidak ada gambar yatim
            </p>
            <p className="text-xs text-[#5E3622]/70 max-w-sm">
              Semua file di bucket dipakai oleh produk. Coba "Muat Ulang" untuk
              memastikan setelah Anda mengubah katalog.
            </p>
          </div>
        )}
      </section>

      {/* Info */}
      <section className="rounded-2xl bg-[#2A140B] text-[#FAF7F2] p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#B87932]/20 text-[#C58B47] flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-serif text-base font-bold mb-1">Cara kerja</p>
            <p className="text-xs text-[#EAE2D5]/80 leading-relaxed">
              Gambar dikategorikan "yatim" bila path-nya di bucket tidak muncul
              pada kolom <code className="text-[#C58B47]">image_url</code> produk
              mana pun. Penghapusan bersifat permanen di Supabase Storage —
              pastikan gambar tidak dipakai sebelum dihapus.
            </p>
          </div>
        </div>
      </section>

      {/* Confirm sel */}
      <DualConfirmModal
        open={confirm?.kind === 'orphan'}
        title="Hapus Gambar Yatim"
        description={
          confirm?.kind === 'orphan' && confirm.paths.length > 1 ? (
            <>
              <strong className="text-[#2A140B]">{confirm.paths.length} gambar</strong>{' '}
              terpilih akan dihapus permanen dari bucket.
            </>
          ) : (
            'Gambar ini tidak direferensikan produk mana pun dan akan dihapus permanen dari bucket.'
          )
        }
        confirmLabel="Hapus"
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      {/* Confirm semua */}
      <DualConfirmModal
        open={confirm?.kind === 'all'}
        title="Hapus Semua Gambar Yatim"
        description={
          <>
            Seluruh <strong className="text-[#2A140B]">{state.orphans.length}</strong>{' '}
            gambar yatim akan dihapus permanen dari bucket (
            {formatBytes(freed)}).
          </>
        }
        confirmLabel="Hapus Semua"
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
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