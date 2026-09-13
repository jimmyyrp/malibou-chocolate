-- =====================================================================
-- Malibou Chocolate — Migration 0004: Tabel Users (Akun Admin)
-- -------------------------------------------------------------
-- Akun untuk login ke Dashboard Katalog (/admin).
-- User seed default:  username = admin , password = malibou123
-- (password disimpan sebagai hash bcrypt via pgcrypto).
--
-- Keamanan:
--   - RLS diaktifkan dan TIDAK ada policy untuk role anon/authenticated.
--   - Akses hanya lewat secret/service key (melewati RLS) dari dashboard
--     admin, sehingga publik/anon benar-benar tidak bisa membaca tabel ini.
-- =====================================================================

create table public.users (
    id            uuid primary key default gen_random_uuid(),
    username      text not null unique,
    password_hash text not null,
    display_name  text not null default '',
    role          text not null default 'admin' check (role in ('admin', 'manager', 'viewer')),
    is_active     boolean not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

comment on table public.users is
    'Akun admin dashboard. RLS aktif tanpa policy anon; hanya diakses via service key.';

create index users_username_idx on public.users (username);

create trigger users_set_updated_at
    before update on public.users
    for each row
    execute function public.set_updated_at();

alter table public.users enable row level security;

-- Tidak ada policy yang dibuat: role anon/authenticated ditolak otomatis
-- (service key yang dipakai dashboard admin melewati RLS dan tetap bekerja).

-- ---------------------------------------------------------------------
-- Seed: akun admin awal (bcrypt, cost 10)
-- ---------------------------------------------------------------------
insert into public.users (username, password_hash, display_name, role)
values (
    'admin',
    crypt('malibou123', gen_salt('bf', 10)),
    'Administrator',
    'admin'
)
on conflict (username) do nothing;

-- ---------------------------------------------------------------------
-- Realtime: aktifkan streaming perubahan untuk tabel users
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.users;

-- =====================================================================
-- END Migrasi 0004
-- =====================================================================