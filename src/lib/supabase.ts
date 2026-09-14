import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Konfigurasi Supabase untuk Malibou Chocolate — sisi browser.
 *
 * - supabasePublic -> key publishable (anon). Dipakai storefront untuk
 *                     membaca katalog & mengirim pesanan.
 *
 * SEMUA operasi tulis/admin (CRUD katalog & upload gambar) dilakukan lewat
 * API route server-side (/api/admin/...) yang memakai secret key di server.
 * Secret key TIDAK boleh berada di bundle browser — Supabase memblokirnya
 * (403 "Forbidden use of secret API key in browser").
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || '';

/** Bucket Supabase Storage untuk foto produk (dibuat oleh migration 0005). */
export const PRODUCT_IMAGES_BUCKET = 'product-images';

export const isSupabaseConfigured = (): boolean =>
  Boolean(supabaseUrl && publishableKey);

/**
 * Opsi auth sengaja dimatikan: aplikasi tidak memakai Supabase Auth,
 * hanya storage/katalog. `storageKey` dibedakan per klien agar
 * tidak muncul peringatan "Multiple GoTrueClient instances" (protokol
 * tidak boleh berbagi storage key auth yang sama di satu peramban).
 */
const authOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
} as const;

export const supabasePublic: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, publishableKey, {
      auth: { ...authOptions, storageKey: 'malibou-public-auth' },
    })
  : null;

/**
 * Tulis-admin (CRUD katalog) disediakan oleh API route server-side.
 * Helper berikut menyingkat pemanggilan fetch ke route tersebut.
 */
async function adminFetch(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; error: string | null }> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Server tidak dapat dijangkau.',
    };
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      ok: false,
      error: (body && typeof body.error === 'string' && body.error) || `HTTP ${res.status}`,
    };
  }
  return { ok: true, error: null };
}

export const adminApi = {
  /** Tambah satu produk baru. */
  add: (row: unknown) =>
    adminFetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify({ product: row }),
    }),
  /** Upsert batch seluruh katalog (hapus id yang tidak ada). */
  saveAll: (rows: unknown[]) =>
    adminFetch('/api/admin/products', {
      method: 'PUT',
      body: JSON.stringify({ products: rows }),
    }),
  /** Perbarui satu produk per id. */
  update: (id: number, row: unknown) =>
    adminFetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ product: row }),
    }),
  /** Hapus beberapa produk sekaligus. */
  remove: (ids: number[]) =>
    adminFetch('/api/admin/products', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
};

/** URL publik sebuah objek di bucket gambar produk. */
export const storageImageUrl = (path: string): string =>
  `${supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path}`;

/** URL jaringan yang sudah aman untuk field URL (bukan path bucket). */
export const toSafeImageUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:') return trimmed;
  } catch {
    // bukan URL absolut — anggap path di dalam bucket
  }
  return storageImageUrl(trimmed.replace(/^\/+/, ''));
};