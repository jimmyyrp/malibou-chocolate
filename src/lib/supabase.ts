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

export const isSupabaseConfigured = (): boolean =>
  Boolean(supabaseUrl && publishableKey);

export const supabasePublic: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, publishableKey)
  : null;

export const supabaseAdmin: SupabaseClient | null = (() => {
  if (supabaseUrl && secretKey) return createClient(supabaseUrl, secretKey);
  return supabasePublic;
})();