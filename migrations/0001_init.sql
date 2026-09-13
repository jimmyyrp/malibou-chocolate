-- =====================================================================
-- Malibou Chocolate — Migration 0001: Skema Awal Database (Katalog)
-- -------------------------------------------------------------
-- Mencakup: tabel katalog (categories, products), trigger updated_at,
-- dan RLS untuk pembacaan publik.
--
-- Catatan keamanan & akses:
--   - Pembacaan katalog publik diizinkan untuk role `anon` (key
--     publishable di sisi storefront).
--   - Penulisan katalog (dashboard admin) memakai secret/service key
--     yang otomatis melewati RLS.
--   - Tidak ada tabel transaksi/pesanan di sini (aplikasi hanya katalog;
--     pesanan dikirim langsung via WhatsApp).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Ekstensi (pgcrypto dipakai juga oleh migrasi users)
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 2) Katalog: Categories
-- ---------------------------------------------------------------------
create table public.categories (
    id          text primary key,
    name        text not null,
    icon        text not null default '🍫',
    description text not null default '',
    sort_order  integer not null default 0,
    created_at  timestamptz not null default now()
);

comment on table public.categories is 'Kategori produk katalog Malibou Chocolate.';

-- ---------------------------------------------------------------------
-- 3) Katalog: Products
-- ---------------------------------------------------------------------
create table public.products (
    id          text primary key,
    code        text not null unique,
    name        text not null,
    category_id text not null references public.categories (id) on update cascade on delete restrict,
    price       integer not null check (price >= 0),
    unit        text not null default 'pcs',
    weight      text,
    description text not null default '',
    image_url   text not null,
    featured    boolean not null default false,
    sort_order  integer not null default 0,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

comment on table public.products is 'Daftar produk katalog Malibou Chocolate.';

create index products_category_idx  on public.products (category_id);
create index products_featured_idx  on public.products (featured);
create index products_sort_order_idx on public.products (sort_order);

-- Trigger untuk mengisi updated_at secara otomatis
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger products_set_updated_at
    before update on public.products
    for each row
    execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4) Row Level Security
-- ---------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products   enable row level security;

-- Katalog publik: anon & authenticated boleh membaca
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
    on public.categories
    for select
    to anon, authenticated
    using (true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
    on public.products
    for select
    to anon, authenticated
    using (true);

-- ---------------------------------------------------------------------
-- 5) Realtime: aktifkan streaming perubahan untuk tabel katalog
--    (tabel harus punya primary key — sudah terpenuhi)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.products;

-- =====================================================================
-- END Migrasi 0001
-- =====================================================================