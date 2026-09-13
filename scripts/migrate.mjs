// =====================================================================
// Malibou Chocolate — Migration Runner
// -------------------------------------------------------------
// Menjalankan seluruh file SQL di folder ./migrations ke database
// Supabase secara urut & aman (transaksi per file), tanpa perlu
// membuka/menyalin SQL secara manual.
//
// Pemakaian:
//   npm run db:migrate             -> terapkan migrasi baru
//   npm run db:migrate:reset       -> DROP semua tabel aplikasi lalu
//                                     terapkan ulang dari awal (HATI-HATI)
//
// Koneksi dibaca dari DATABASE_URL di .env.local (atau variabel env).
// =====================================================================

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { lookup as dnsLookup } from 'node:dns';
import { promisify } from 'node:util';
import pg from 'pg';

const { Client } = pg;
const dnsLookupAsync = promisify(dnsLookup);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MIGRATIONS_DIR = join(ROOT, 'migrations');

// ---------------------------------------------------------------------
// 1) Parser .env sederhana (KEY="value" / KEY=value, komentar #)
// ---------------------------------------------------------------------
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

// ---------------------------------------------------------------------
// 2) Utilitas lain
// ---------------------------------------------------------------------
const APP_TABLES = ['categories', 'products', 'users'];

// Parse string koneksi postgresql:// tanpa bergantung pada URL parser,
// sehingga password berisi karakter khusus (/ + @ dll) tetap aman.
function parseDbUrl(url) {
  const m = url.match(
    /^postgres(?:ql)?:\/\/([^:]+):([^@]*)@([^:/]+)(?::(\d+))?\/([^?]+)/
  );
  if (!m) return null;
  return {
    user: decodeURIComponent(m[1]),
    password: decodeURIComponent(m[2]),
    host: m[3],
    port: m[4] ? Number(m[4]) : 5432,
    database: m[5],
  };
}

// Resolve hostname database. Host supabase "db.<ref>.supabase.co" hanya
// punya record AAAA (IPv6). dns.lookup bawaan Windows kadang gagal
// mengambilnya, jadi kita paksa lookup IPv6 dulu lalu fallback IPv4.
async function resolveHost(host) {
  const isLiteral = host.startsWith('[') || /^[\da-fA-F:]+$/.test(host);
  if (isLiteral) return host.replace(/^\[|\]$/g, '');
  try {
    const { address } = await dnsLookupAsync(host, { family: 6 });
    return address;
  } catch {
    try {
      const { address } = await dnsLookupAsync(host, { family: 4 });
      return address;
    } catch {
      return host;
    }
  }
}

function printDivider() {
  console.log('--------------------------------------------------------');
}

async function tableCounts(client) {
  console.log('\nRingkasan data saat ini:');
  for (const table of APP_TABLES) {
    try {
      const { rows } = await client.query(
        `select count(*)::int as c from public.${table}`
      );
      console.log(`  public.${table.padEnd(14)} ${rows[0].c} baris`);
    } catch (err) {
      console.log(`  public.${table.padEnd(14)} (belum ada: ${err.message})`);
    }
  }
}

// ---------------------------------------------------------------------
// 3) Main
// ---------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const doReset = args.includes('--reset');

  const env = { ...loadEnvFile(join(ROOT, '.env')), ...loadEnvFile(join(ROOT, '.env.local')) };
  const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error(
      'ERROR: DATABASE_URL tidak ditemukan.\n\n' +
        'Tambahkan baris berikut di file .env.local (lihat .env.example):\n\n' +
        '  DATABASE_URL=postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres\n'
    );
    process.exit(1);
  }

  console.log('Menghubungkan ke Supabase database ...');
  const parsed = parseDbUrl(dbUrl);
  if (!parsed) {
    console.error(
      'ERROR: DATABASE_URL tidak dapat diparse. Pastikan formatnya:\n' +
        'postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres'
    );
    process.exit(1);
  }

  const host = await resolveHost(parsed.host);
  const client = new Client({
    user: parsed.user,
    password: parsed.password,
    host,
    port: parsed.port,
    database: parsed.database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log(`Koneksi berhasil (${parsed.host} -> ${host}).\n`);

    if (doReset) {
      printDivider();
      console.log('MODE --reset: menghapus tabel aplikasi lalu terapkan ulang ...');
      await client.query(`drop table if exists public.order_items cascade`);
      await client.query(`drop table if exists public.orders cascade`);
      await client.query(`drop table if exists public.users cascade`);
      await client.query(`drop table if exists public.products cascade`);
      await client.query(`drop table if exists public.categories cascade`);
      await client.query(`drop table if exists public._migrations`);
      console.log('Tabel aplikasi dibersihkan.\n');
    }

    // Tabel pelacak migrasi
    await client.query(`
      create table if not exists public._migrations (
        name       text primary key,
        applied_at timestamptz not null default now()
      )
    `);

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.error('Tidak ada file .sql di folder migrations/');
      process.exit(1);
    }

    const { rows: appliedRows } = await client.query(
      `select name from public._migrations`
    );
    const applied = new Set(appliedRows.map((r) => r.name));

    printDivider();
    let appliedCount = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`SKIP  ${file}  (sudah diterapkan)`);
        continue;
      }
      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`APPLY ${file}`);
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          `insert into public._migrations (name) values ($1)`,
          [file]
        );
        await client.query('COMMIT');
        appliedCount += 1;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`\nGAGAL menerapkan ${file}:`);
        console.error(err.message);
        console.error(
          '\nTidak ada perubahan yang disimpan untuk file ini (di-rollback).\n' +
            'Perbaiki skema lalu jalankan ulang: npm run db:migrate'
        );
        await client.end().catch(() => {});
        process.exitCode = 1;
        return;
      }
    }

    if (appliedCount === 0 && !doReset) {
      console.log('Tidak ada migrasi baru — semuanya sudah terpasang.');
    } else {
      console.log(`${appliedCount} migrasi berhasil diterapkan.`);
    }

    // Verifikasi akhir
    printDivider();
    await tableCounts(client);
    printDivider();

    // Contoh isi Data Katalog
    const { rows: products } = await client.query(`
      select p.id, p.name, c.name as kategori, p.price
      from public.products p
      join public.categories c on c.id = p.category_id
      order by p.sort_order
      limit 5
    `);
    console.log('\nContoh 5 produk pertama:');
    for (const p of products) {
      console.log(
        `  ${String(p.id).padEnd(4)} ${p.name.padEnd(34)} ${p.kategori.padEnd(16)} Rp ${p.price}`
      );
    }
    console.log('\nMigrasi selesai. ✓');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();