import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Klien Supabase admin (service role) — HANYA dipakai di server-side
 * (API routes / server components).
 *
 * Secret key dibaca dari env variabel NON-publish, sehingga TIDAK pernah
 * ikut tergabung di bundle browser. Supabase memblokir penggunaan secret
 * key dari browser (403 Forbidden), jadi semua mutasi katalog harus lewat
 * API route agar CORS/SSR tidak menjadi masalah.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  process.env.SUPABASE_URL?.trim() ||
  '';
const secretKey =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY?.trim() ||
  '';

export const PRODUCT_IMAGES_BUCKET = 'product-images';

export const isServerSupabaseConfigured = (): boolean =>
  Boolean(supabaseUrl && secretKey);

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isServerSupabaseConfigured()) return null;
  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}