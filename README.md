# Malibou Chocolate — Modern Cocoa House

Katalog resmi olahan cokelat, bubuk kakao, cocoa butter, dan koleksi spesial
rendang Malibou — **From Cocoa to Chocolate**.

Stack: **Next.js 16** (App Router, server app) · React 19 · Tailwind CSS 4 ·
**Supabase** (PostgreSQL + PostgREST + Realtime).

---

## Menjalankan Lokal

1. Install dependencies:
   ```bash
   npm install
   ```

2. Siapkan file `.env.local` (salin dari `.env.example` dan isi kredensial Supabase):
   ```bash
   cp .env.example .env.local
   ```

3. Migrasikan database (schema + seed katalog):
   ```bash
   npm run db:migrate
   ```

4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

   Halaman admin: `/admin` — login memakai akun `admin` / `malibou123`
   (diverifikasi ke tabel `public.users`, hash bcrypt).

   Fitur dashboard admin:
   - **Dashboard** — statistik katalog (jumlah produk, kategori, unggulan, nilai katalog, distribusi harga).
   - **Produk** — tambah / edit / hapus / tandai unggulan / reset katalog.
   - **Cadangan & Pemulihan** — unduh katalog sebagai JSON, pulihkan dari berkas atau riwayat lokal, serta cadangan otomatis sebelum reset.
   - **Gambar Yatim** — deteksi file di bucket `product-images` yang tidak dipakai produk, lalu hapus secara selektif / massal.

---

## Variabel Environment (`.env.local`)

| Variabel | Fungsi |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Key publik/anon. Dipakai browser untuk membaca katalog. |
| `SUPABASE_SECRET_KEY` | Key secret/service. **Server-side only** (API routes `/api/admin/*`). Jangan beri prefix `NEXT_PUBLIC_`. |
| `DATABASE_URL` | Koneksi PostgreSQL untuk **migration runner**. Tidak pernah masuk ke kode browser (bukan `NEXT_PUBLIC_`). |

> Karakter khusus pada password database harus di-URL-encode
> (`/` → `%2F`, `+` → `%2B`, `@` → `%40`).
>
> Tidak ada variabel password/username admin — login diverifikasi ke
> database (tabel `users`). Tanpa Supabase (modus demo), aplikasi memakai
> fallback `admin` / `malibou123` dari `src/lib/adminConfig.ts`.

---

## Skema Database

Semua berada di schema `public` — **aplikasi ini hanya katalog** (tanpa
tabel pesanan; pemesanan diteruskan langsung ke WhatsApp).

| Tabel | Isi |
| --- | --- |
| `categories` | 6 kategori katalog (bar, praline, drink, cocoa, ball-choco, rendang) |
| `products` | 30 produk awal + produk hasil kelola admin |
| `users` | Akun pengelola dashboard (login admin) |

Fitur:
- **RLS (Row Level Security)**: publik (anon) boleh `SELECT` katalog;
  `users` **tanpa policy apa pun** sehingga tidak terbaca/ditulis publik —
  hanya diakses lewat secret key.
- **Realtime**: `categories`, `products`, dan `users` terdaftar di
  publication `supabase_realtime`.
- Trigger `updated_at` di `products`.
- Indeks pada kolom pencarian populer (`category_id`, `featured`, `sort_order`).

---

## Migrasi Database

### `npm run db:migrate`
Menerapkan semua file `.sql` di folder `migrations/` yang belum terpasang,
secara berurutan dan dibungkus transaksi (gagal = rollback). Migrasi yang
sudah pernah diterapkan dicatat di tabel `public._migrations` sehingga
tidak dieksekusi dua kali.

### `npm run db:verify`
Memeriksa kesehatan skema & data: jumlah produk per kategori, produk
unggulan, integritas data, keanggotaan publication Realtime, daftar policy
RLS, akun admin (`users`), dan uji akses REST memakai key publishable.

### `npm run db:migrate:reset`
**Hati-hati**: menghapus seluruh tabel aplikasi (`categories`, `products`,
`users`) lalu menerapkan ulang dari awal.

---

## Arsitektur Data (Aplikasi ↔ Supabase)

- Storefront membaca katalog dari `products` lewat key publishable; bila
  env `NEXT_PUBLIC_*` tidak tersedia (mis. hanya ada `SUPABASE_URL` di
  Vercel), otomatis jatuh ke route publik `/api/catalog` yang memakai
  service key di sisi server — katalog tetap tampil.
- Dashboard admin (`/admin`) melakukan semua operasi tulis lewat
  **API route server-side** (`/api/admin/products/*`, `/api/admin/storage`)
  yang memakai secret key di server untuk:
  - verifikasi login terhadap `users` (bcrypt),
  - insert/update/delete produk. Perubahan admin langsung tersimpan di
    database dan tampil di semua perangkat.
- Pemesanan diteruskan ke WhatsApp (`wa.me/<no official>`); tidak ada
  penyimpanan pesanan di database.

**Catatan keamanan**: aplikasi berjalan sebagai server app (`next start`),
bukan static export. Secret key hanya dipegang server (env `SUPABASE_SECRET_KEY`,
tanpa prefix `NEXT_PUBLIC_`), sehingga **tidak pernah masuk ke bundle
browser**. Supabase memblokir secret key yang dipakai dari browser
(`403 Forbidden use of secret API key in browser`) — semua mutasi katalog
harus melewati API route.

---

## Troubleshooting

- **Koneksi database gagal / `ENOTFOUND` (IPv6)**: host
  `db.<ref>.supabase.co` hanya punya record AAAA (IPv6). Runner migrasi
  sudah otomatis memaksa lookup IPv6 lalu fallback IPv4. Pastikan koneksi
  internet Anda mendukung IPv6.
- **Login admin ditolak**: pastikan migrasi sudah dijalankan dan akun
  `admin` ada di tabel `users` (`npm run db:verify`). Jika lupa sandi,
  reset akun lewat SQL:
  ```sql
  update public.users
     set password_hash = crypt('malibou123', gen_salt('bf', 10))
   where username = 'admin';
  ```
- **Absen di `NEXT_PUBLIC_*`**: nilai berawalan `NEXT_PUBLIC_` di-inline ke
  bundle saat `next build`. Tanpa `NEXT_PUBLIC_SUPABASE_URL`/
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, storefront otomatis membaca lewat
  `/api/catalog` (server-side), jadi katalog tetap tampil — pastikan
  `SUPABASE_SECRET_KEY` tersedia di server.
- **Menambah kategori baru**: pastikan juga ada di `CATEGORIES`
  (`src/data/products.ts`) agar ikon/deskripsi tampil di storefront.