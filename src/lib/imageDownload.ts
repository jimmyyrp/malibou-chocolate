/** Hasil percobaan unduh gambar. */
export type DownloadResult = 'ok' | 'tab' | 'fail';

/**
 * Unduh gambar dari URL ke perangkat pengguna.
 * - 'ok':  blob berhasil diunduh ke perangkat.
 * - 'tab': CORS menolak fetch, gambar dibuka di tab baru.
 * - 'fail': URL kosong/tidak valid, tidak ada tindakan.
 */
export async function downloadImage(url: string): Promise<DownloadResult> {
  const href = url.trim();
  if (!href) return 'fail';

  try {
    const res = await fetch(href, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filenameFromUrl(href);
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Beri waktu proses download dimulai sebelum melepas object URL.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
    return 'ok';
  } catch {
    // Berkas lintas-domain/tanpa CORS tidak bisa di-fetch — buka saja.
    window.open(href, '_blank', 'noopener,noreferrer');
    return 'tab';
  }
}

export function isOpenableUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return v.startsWith('data:') || v.startsWith('blob:') || /^https?:\/\//i.test(v);
}

function filenameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname || parsed.pathname === '/') return 'malibou-gambar.jpg';
    const base = parsed.pathname.split('/').pop() || 'malibou-gambar.jpg';
    const decoded = decodeURIComponent(base);
    // Path bucket berisi nama produk — bentuk nama unduhan yang rapi.
    if (/^products\//i.test(parsed.pathname)) {
      return `${stripExt(decoded)}.jpg`;
    }
    return decoded;
  } catch {
    return 'malibou-gambar.jpg';
  }
}

function stripExt(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx > 0 ? name.slice(0, idx) : name;
}