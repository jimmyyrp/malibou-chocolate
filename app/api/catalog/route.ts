import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isServerSupabaseConfigured } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

// Route publik (tanpa autentikasi) untuk membaca katalog dari sisi server.
// Dipakai sebagai fallback storefront saat kredensial client (NEXT_PUBLIC_*)
// tidak tersedia di lingkungan deployment, misalnya hanya ada SUPABASE_URL
// tanpa prefix NEXT_PUBLIC_ di Vercel — data tetap terbaca via service key.
export async function GET() {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Supabase belum dikonfigurasi di sisi server.' },
      { status: 503 }
    );
  }

  const supabase = getSupabaseAdmin();
  const [cats, prods] = await Promise.all([
    supabase
      .from('categories')
      .select('id, slug, name')
      .order('sort_order', { ascending: true }),
    supabase.from('products').select('*').order('sort_order', { ascending: true }),
  ]);

  if (cats.error || prods.error) {
    return NextResponse.json(
      { ok: false, error: cats.error?.message ?? prods.error?.message ?? 'Gagal memuat katalog.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, categories: cats.data ?? [], products: prods.data ?? [] });
}