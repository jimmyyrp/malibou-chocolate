import { NextRequest, NextResponse } from 'next/server';
import {
  PRODUCT_IMAGES_BUCKET,
  getSupabaseAdmin,
  isServerSupabaseConfigured,
} from '@/lib/supabaseServer';

export const runtime = 'nodejs';

function badEnv(): NextResponse {
  return NextResponse.json(
    { error: 'Server tidak memiliki kredensial Supabase.' },
    { status: 500 }
  );
}

/**
 * POST /api/admin/storage
 * Unggah gambar produk ke bucket storage.
 *
 * Body (multipart/form-data):
 *   - file : berkas gambar
 *   - path : path tujuan di bucket (mis. "products/nama-1699999999999.jpg")
 *   - upsert : "1"/"true" untuk menimpa file lama (opsional)
 *
 * Response: { ok: true, path }
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!isServerSupabaseConfigured() || !supabase) return badEnv();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'Badan permintaan tidak valid (harus multipart/form-data).' },
      { status: 400 }
    );
  }

  const file = form.get('file');
  const rawPath = form.get('path');
  const upsertRaw = form.get('upsert');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Berkas gambar wajib dilampirkan (field "file").' },
      { status: 400 }
    );
  }
  if (!file.type || !file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'File harus berupa gambar (jpeg/png/webp/gif/avif).' },
      { status: 400 }
    );
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Ukuran berkas melebihi 25 MB.' },
      { status: 400 }
    );
  }
  if (!rawPath || typeof rawPath !== 'string' || !rawPath.trim()) {
    return NextResponse.json({ error: 'Path tujuan wajib diisi.' }, { status: 400 });
  }

  const path = rawPath.trim().replace(/^\/+/, '');
  const upsert = upsertRaw === '1' || upsertRaw === 'true';

  try {
    // Node.js native FormData: File punya arrayBuffer()
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, buffer, { upsert, contentType: file.type || 'image/png' });
    if (error) throw error;
    return NextResponse.json({ ok: true, path });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal mengunggah gambar.' },
      { status: 502 }
    );
  }
}