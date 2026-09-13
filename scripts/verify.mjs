// =====================================================================
// Malibou Chocolate — Verifikasi Database
// -------------------------------------------------------------
// Menampilkan ringkasan kesehatan skema & data katalog, plus uji akses
// REST (anon/publishable) yang akan dipakai aplikasi di browser.
//
// Pemakaian: npm run db:verify
// =====================================================================

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { lookup as dnsLookup } from 'node:dns';
import { promisify } from 'node:util';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;
const dnsLookupAsync = promisify(dnsLookup);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadEnvFile(filePath) {
  const out = {};
  if (!existsSync(filePath)) return out;
  for (const raw of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
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

const EXPECTED = { 'chocolate-bar': 4, 'praline-snack': 4, 'chocolate-drink': 4, 'cocoa-ingredients': 7, 'ball-choco': 1, rendang: 10 };
const EXPECTED_FEATURED = 7;

async function main() {
  const env = { ...loadEnvFile(join(ROOT, '.env')), ...loadEnvFile(join(ROOT, '.env.local')) };
  const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  const projectUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL tidak ditemukan di .env.local');
    process.exit(1);
  }

  const parsed = parseDbUrl(dbUrl);
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

  let failed = false;
  const fail = (msg) => {
    failed = true;
    console.log(`  [DOSUL] ${msg}`);
  };
  const ok = (msg) => console.log(`  [ok]    ${msg}`);

  try {
    await client.connect();
    console.log('== Database terhubung ==\n');

    console.log('-- Skema / Tabel --');
    const { rows: tables } = await client.query(`
      select tablename
      from pg_tables
      where schemaname = 'public'
      order by tablename
    `);
    const present = tables.map((t) => t.tablename);
    for (const t of ['categories', 'products', 'users', '_migrations']) {
      present.includes(t) ? ok(`tabel ${t} ada`) : fail(`tabel ${t} TIDAK ADA`);
    }

    console.log('\n-- Realtime Publication (supabase_realtime) --');
    const { rows: rt } = await client.query(`
      select pt.tablename
      from pg_publication_tables pt
      join pg_publication p on p.pubname = pt.pubname
      where p.pubname = 'supabase_realtime'
        and pt.schemaname = 'public'
      order by pt.tablename
    `);
    const realtimeTables = new Set(rt.map((r) => r.tablename));
    for (const t of ['categories', 'products', 'users']) {
      realtimeTables.has(t)
        ? ok(`realtime aktif: ${t}`)
        : fail(`realtime TIDAK aktif: ${t}`);
    }

    console.log('\n-- Data Katalog (jumlah) --');
    const { rows: totals } = await client.query(`
      select c.id, c.name, count(p.id)::int as n
      from public.categories c
      left join public.products p on p.category_id = c.id
      group by c.id, c.name
      order by c.sort_order
    `);
    totals.forEach((r) => {
      const expected = EXPECTED[r.id];
      if (expected === undefined) {
        fail(`kategori tidak dikenal: ${r.id}`);
        return;
      }
      r.n === expected ? ok(`${r.name} (${r.id}): ${r.n} produk`) : fail(`${r.name}: ${r.n} produk (diharapkan ${expected})`);
    });
    const totalProducts = totals.reduce((s, r) => s + r.n, 0);
    totalProducts === 30 ? ok(`Total produk: ${totalProducts}`) : fail(`Total produk: ${totalProducts} (harus 30)`);

    const { rows: feat } = await client.query(`select count(*)::int as n from public.products where featured = true`);
    feat[0].n === EXPECTED_FEATURED ? ok(`Produk unggulan: ${feat[0].n}`) : fail(`Produk unggulan: ${feat[0].n} (harus ${EXPECTED_FEATURED})`);

    console.log('\n-- Integritas --');
    const { rows: orphan } = await client.query(`
      select (select count(*) from public.products p left join public.categories c on c.id = p.category_id where c.id is null)::int as orphan_products,
             (select count(*) from public.products where price < 0)::int as neg_price,
             (select count(*) from public.products where code is null or name is null or description is null or image_url is null)::int as null_fields
    `);
    orphan[0].orphan_products === 0 ? ok('tidak ada produk tanpa kategori') : fail(`produk tanpa kategori: ${orphan[0].orphan_products}`);
    orphan[0].neg_price === 0 ? ok('tidak ada harga negatif') : fail(`harga negatif: ${orphan[0].neg_price}`);
    orphan[0].null_fields === 0 ? ok('tidak ada field wajib NULL') : fail(`field wajib NULL: ${orphan[0].null_fields}`);

    const { rows: prices } = await client.query(`
      select min(price)::int as min, max(price)::int as max, sum(price)::bigint as total
      from public.products
    `);
    ok(`Rentang harga: Rp ${prices[0].min} – Rp ${prices[0].max} (total ${prices[0].total})`);

    console.log('\n-- Akun Admin (users) --');
    const { rows: users } = await client.query(`
      select username, role, is_active, password_hash
      from public.users
      order by created_at
    `);
    if (users.length === 0) {
      fail('tidak ada akun pengguna sama sekali (users kosong)');
    } else {
      users.forEach((u) => {
        ok(`akun ${u.username} (${u.role}, aktif: ${u.is_active})`);
        if (!u.password_hash || u.password_hash.length < 20) {
          fail(`password hash akun ${u.username} tidak valid`);
        }
      });
      const admin = users.find((u) => u.username === 'admin');
      if (admin) {
        const match = await bcrypt.compare('malibou123', admin.password_hash);
        match
          ? ok('kredensial default admin / malibou123 >>> cocok dengan hash di DB')
          : fail('kredensial default admin / malibou123 TIDAK cocok');
      } else {
        fail('akun admin tidak ditemukan');
      }
    }

    console.log('\n== RLS (Row Level Security) ==');
    const { rows: rls } = await client.query(`
      select tablename, policyname, cmd, roles
      from pg_policies
      where schemaname = 'public'
      order by tablename, policyname
    `);
    if (rls.length === 0) {
      fail('tidak ada policy RLS sama sekali');
    } else {
      rls.forEach((p) => {
        const roles = Array.isArray(p.roles) ? p.roles.join(',') : String(p.roles);
        ok(`${p.tablename}.${p.policyname} (${p.cmd}, role: ${roles})`);
      });
    }
  } catch (err) {
    failed = true;
    console.error('ERROR:', err.message);
  } finally {
    await client.end().catch(() => {});
  }

  // -----------------------------------------------------------------
  // Uji akses REST (publishable/anon) seperti aplikasi di browser
  // -----------------------------------------------------------------
  console.log('\n== Uji REST API (key publishable) ==');
  try {
    const res = await fetch(`${projectUrl}/rest/v1/products?select=id,code,name,price&limit=3`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Connection: 'close' },
    });
    const text = await res.text();
    if (res.ok) {
      const data = JSON.parse(text);
      ok(`GET /rest/v1/products -> ${res.status} (${data.length} baris diterima)`);
    } else {
      fail(`GET /rest/v1/products -> ${res.status}: ${text.slice(0, 160)}`);
    }
  } catch (err) {
    fail(`REST error: ${err.message}`);
  }

  console.log(failed ? '\nADA MASALAH / CEK DI ATAS.' : '\nSEMUA VERIFIKASI LULUS. ✓');
  process.exitCode = failed ? 1 : 0;
}

main();