import { NextRequest, NextResponse } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';
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

interface StorageItem {
  name: string;
  id: string | null;
  path: string;
  size: number | null;
  updatedAt: string | null;
  createdAt: string | null;
  isFolder: boolean;
}

/**
 * Susun daftar lengkap objek di bucket secara rekursif (termasuk subfolder).
 * Storage API hanya mengembalikan maks. 100 objek per panggilan.
 */
async function listAllObjects(
  supabase: SupabaseClient,
  folder = '',
  prefix = ''
): Promise<StorageItem[]> {
  const items: StorageItem[] = [];
  let offset = 0;
  const LIMIT = 100;
  for (;;) {
    const { data, error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .list(folder, {
        limit: LIMIT,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });
    if (error) throw error;
    const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
    const files = rows.filter((r) => r.id !== null);
    for (const r of files) {
      items.push({
        name: String(r.name),
        id: String(r.id),
        path: prefix ? `${prefix}/${r.name}` : String(r.name),
        size:
          r.metadata && typeof r.metadata === 'object'
            ? Number((r.metadata as Record<string, unknown>).size ?? 0)
            : null,
        updatedAt: typeof r.updated_at === 'string' ? r.updated_at : null,
        createdAt: typeof r.created_at === 'string' ? r.created_at : null,
        isFolder: false,
      });
    }
    const folders = rows.filter(
      (r) => r.id === null && typeof r.name === 'string'
    );
    for (const r of folders) {
      const sub = prefix ? `${prefix}/${r.name}` : String(r.name);
      const child = await listAllObjects(supabase, sub, sub);
      items.push(...child);
    }
    if (rows.length < LIMIT) break;
    offset += LIMIT;
  }
  return items;
}

/**
 * GET /api/admin/storage
 * Daftar seluruh objek di bucket + klasifikasi gambar "yatim" (tidak
 * direferensikan produk mana pun).
 *
 * Response:
 *   { total, totalSize, orphans: [...], referencedCount, orphanSize }
 *   orphans[]: { path, name, size, updatedAt, createdAt, url }
 */
export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!isServerSupabaseConfigured() || !supabase) return badEnv();

  try {
    const [items, products] = await Promise.all([
      listAllObjects(supabase),
      supabase.from('products').select('image_url'),
    ]);
    if (products.error) throw products.error;

    const referenced = new Set<string>();
    for (const row of (products.data ?? []) as Array<{ image_url: string }>) {
      const url = row.image_url || '';
      const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const path = url.slice(idx + marker.length).split('?')[0].replace(/^\/+/, '');
        if (path) referenced.add(path);
      } else if (!/^https?:\/\//i.test(url) && url.trim()) {
        // path polos (mis. "products/xxx.jpg") → dianggap referensi bucket
        referenced.add(url.trim().replace(/^\/+/, ''));
      }
    }

    const orphans = items
      .filter((it) => !it.isFolder && !referenced.has(it.path))
      .map((it) => ({
        path: it.path,
        name: it.name,
        size: it.size ?? 0,
        updatedAt: it.updatedAt,
        createdAt: it.createdAt,
        url: `${supabaseUrlBase()}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${it.path}`,
      }));

    const totalSize = items.reduce((s, it) => s + (it.size ?? 0), 0);
    const orphanSize = orphans.reduce((s, it) => s + it.size, 0);

    return NextResponse.json({
      ok: true,
      total: items.length,
      totalSize,
      referencedCount: referenced.size,
      orphans,
      orphanSize,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal memuat daftar file.' },
      { status: 502 }
    );
  }
}

function supabaseUrlBase(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()?.replace(/\/+$/, '') || ''
  );
}

/**
 * DELETE /api/admin/storage
 * Hapus satu / beberapa objek dari bucket.
 * Body: { paths: string[] }
 */
export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!isServerSupabaseConfigured() || !supabase) return badEnv();

  let body: { paths?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak valid.' }, { status: 400 });
  }

  const paths = Array.isArray(body.paths)
    ? (body.paths as unknown[]).filter(
        (p): p is string => typeof p === 'string' && p.trim().length > 0
      )
    : [];
  if (paths.length === 0) {
    return NextResponse.json(
      { error: 'paths wajib berupa array yang tidak kosong.' },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove(paths.map((p) => p.trim().replace(/^\/+/, '')));
    if (error) throw error;
    return NextResponse.json({ ok: true, removed: paths.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal menghapus file.' },
      { status: 502 }
    );
  }
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
  // Batas 5 MB mengikuti file_size_limit bucket (migrasi 0005).
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Ukuran berkas melebihi 5 MB.' },
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