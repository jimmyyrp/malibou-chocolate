import { NextRequest, NextResponse } from 'next/server';
import {
  getSupabaseAdmin,
  isServerSupabaseConfigured,
} from '@/lib/supabaseServer';

export const runtime = 'nodejs';

interface ProductRow {
  id?: number;
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
 * PATCH /api/admin/products/[id]
 * Perbarui satu produk. Body: { product: ProductRow }.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseAdmin();
  if (!isServerSupabaseConfigured() || !supabase) return badEnv();

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: 'ID produk tidak valid.' }, { status: 400 });
  }

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
    const { data, error } = await supabase
      .from('products')
      .update(row)
      .eq('id', productId)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan atau gagal diperbarui.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, product: data[0] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal memperbarui produk.' },
      { status: 502 }
    );
  }
}