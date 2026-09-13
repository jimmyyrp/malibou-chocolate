// =====================================================================
// Malibou Chocolate — Upload Gambar Katalog ke Supabase Storage
// -------------------------------------------------------------
// Menyalin semua foto produk yang masih merujuk URL luar (mis. Unsplash)
// ke bucket storage "product-images", lalu mengubah image_url tiap produk
// menjadi URL publik bucket tersebut.
//
// Pemakaian:
//   npm run db:images                  -> jalankan untuk seluruh produk
//
// Koneksi membaca NEXT_PUBLIC_SUPABASE_URL & secret key dari .env/.env.local.
// =====================================================================

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BUCKET = 'product-images';
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

function loadEnvFile(filePath) {
  const out = {};
  if (!existsSync(filePath)) return out;
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function extFromContentType(contentType) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  };
  return map[(contentType || '').split(';')[0].trim()] || null;
}

async function main() {
  const env = {
    ...loadEnvFile(join(ROOT, '.env')),
    ...loadEnvFile(join(ROOT, '.env.local')),
  };
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    env.NEXT_PUBLIC_SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    console.error(
      'ERROR: NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_SECRET_KEY ' +
        'harus ada di .env/.env.local (lihat .env.example).'
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from('products')
    .select('id, image_url');
  if (error) {
    console.error('ERROR membaca produk:', error.message);
    process.exit(1);
  }

  const pending = (data ?? []).filter(
    (p) => p.image_url && !p.image_url.includes(PUBLIC_PREFIX)
  );
  if (pending.length === 0) {
    console.log('Semua produk sudah memakai gambar dari bucket Supabase. ✓');
    return;
  }
  console.log(`Ditemukan ${pending.length} produk dengan gambar dari URL luar.\n`);

  let ok = 0;
  for (const p of pending) {
    try {
      console.log(`  [id ${p.id}] ${p.image_url}`);
      const res = await fetch(p.image_url);
      if (!res.ok) {
        console.log(`    ! download gagal (${res.status}) — dilewati`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      const ext = extFromContentType(contentType) || 'jpg';
      const path = `products/${p.id}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { upsert: true, contentType });
      if (upErr) {
        console.log(`    ! upload gagal: ${upErr.message}`);
        continue;
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: dbErr } = await supabase
        .from('products')
        .update({ image_url: pub.publicUrl })
        .eq('id', p.id);
      if (dbErr) {
        console.log(`    ! update image_url gagal: ${dbErr.message}`);
        continue;
      }
      ok += 1;
      console.log(`    ✓ -> ${pub.publicUrl}`);
    } catch (err) {
      console.log(`    ! error: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nSelesai: ${ok}/${pending.length} gambar dipindahkan ke bucket. ✓`);
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exitCode = 1;
});