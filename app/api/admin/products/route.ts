import { NextRequest, NextResponse } from 'next/server';
import {
  getSupabaseAdmin,
  isServerSupabaseConfigured,
} from '@/lib/supabaseServer';

export const runtime = 'nodejs';

interface ProductRow {
  id: number;
  name: string;
  category_id: number | string;
  price: number;
  unit: string | null;
  weight: string | null;
  description: string;
  image_url: string;
  featured: boolean | null;
  sort_order?: number | null;
}

function badEnv(): NextResponse {
  return NextResponse.json(
    { error: 'Server tidak memiliki kredensial Supabase.' },
    { status: 500 }
  );
}

/**
 * GET /api/admin/products
 * Ambil katalog + kategori untuk dashboard admin.
 */
export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!isServerSupabaseConfigured() || !supabase) return badEnv();

  try {
    const [cats, prods] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('products').select('*').order('sort_order', { ascending: true }),
    ]);
    if (cats.error) throw cats.error;
    if (prods.error) throw prods.error;
    return NextResponse.json({ categories: cats.data, products: prods.data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal memuat katalog.' },
      { status: 502 }
    );
  }
}

/**
 * POST /api/admin/products
 * Tambah satu produk baru. Body: { product: ProductRow }.
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!isServerSupabaseConfigured() || !supabase) return badEnv();

  let body: { product?: ProductRow };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak valid.' }, { status: 400 });
  }

  const row = body.product;
  if (!row || typeof row.name !== 'string' || !row.name.trim()) {
    return NextResponse.json(
      { error: 'Data produk tidak lengkap (name wajib).' },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase.from('products').insert(row);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal menambah produk.' },
      { status: 502 }
    );
  }
}

/**
 * PUT /api/admin/products
 * Simpan batch (upsert) seluruh katalog + hapus id yang tidak ada di katalog.
 * Body: { products: ProductRow[] }.
 */
export async function PUT(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!isServerSupabaseConfigured() || !supabase) return badEnv();

  let body: { products?: ProductRow[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak valid.' }, { status: 400 });
  }

  const rows = body.products;
  if (!Array.isArray(rows)) {
    return NextResponse.json(
      { error: 'Data produk tidak valid.' },
      { status: 400 }
    );
  }

  try {
    if (rows.length > 0) {
      const { error: upsertErr } = await supabase
        .from('products')
        .upsert(rows, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;
    }

    const keep = new Set(rows.map((r) => r.id));
    const { data, error: selErr } = await supabase.from('products').select('id');
    if (selErr) throw selErr;
    const extras = (data ?? [])
      .map((r) => (r as { id: number }).id)
      .filter((id) => !keep.has(id));
    if (extras.length > 0) {
      const { error: delErr } = await supabase
        .from('products')
        .delete()
        .in('id', extras);
      if (delErr) throw delErr;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal menyimpan katalog.' },
      { status: 502 }
    );
  }
}

/**
 * DELETE /api/admin/products
 * Hapus beberapa produk sekaligus. Body: { ids: number[] }.
 */
export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!isServerSupabaseConfigured() || !supabase) return badEnv();

  let body: { ids?: number[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak valid.' }, { status: 400 });
  }

  const ids = body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids wajib berupa array.' }, { status: 400 });
  }

  try {
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal menghapus produk.' },
      { status: 502 }
    );
  }
}