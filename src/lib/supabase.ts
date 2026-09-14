import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Konfigurasi Supabase untuk Malibou Chocolate.
 *
 * - supabasePublic  -> key publishable (anon). Dipakai storefront untuk
 *                      membaca katalog & mengirim pesanan.
 * - supabaseAdmin   -> key secret/service. Mengesampingkan RLS. Dipakai
 *                      dashboard admin (/admin) untuk CRUD katalog.
 *
 * PERINGATAN KEAMANAN: aplikasi ini static export (tanpa server),
 * sehingga secret key ikut tergabung di bundle browser. Key ini hanya
 * mengelola katalog produk publik — perketat dengan Supabase Auth jika
 * data yang dikelola mulai sensitif.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || '';
const secretKey =
  process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY?.trim() || '';

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

export const supabaseAdmin: SupabaseClient | null = (() => {
  if (supabaseUrl && secretKey)
    return createClient(supabaseUrl, secretKey, {
      auth: { ...authOptions, storageKey: 'malibou-admin-auth' },
    });
  return null;
})();

/**
 * Return true only when supabaseAdmin is a *real* service client (not the
 * anon fallback).  Mutations that bypass RLS MUST use a service client,
 * otherwise PostgREST silently ignores the write (204 with 0 rows changed).
 */
export const isAdminConfigured = (): boolean =>
  supabaseAdmin !== null && supabaseAdmin !== supabasePublic;

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