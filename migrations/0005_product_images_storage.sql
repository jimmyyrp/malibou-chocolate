-- =====================================================================
-- Malibou Chocolate — Migration 0005: Bucket Storage Gambar Produk
-- -------------------------------------------------------------
-- Membuat bucket "product-images" di Supabase Storage (public) untuk
-- menyimpan foto produk. URL publik hasilnya berbentuk:
--   <SUPABASE_URL>/storage/v1/object/public/product-images/<path>
--
-- Izin tulis:
--   - Upload dari dashboard admin memakai secret/service key yang
--     otomatis melewati RLS, jadi tidak perlu policy tambahan.
--   - Bucket public = siapa pun boleh membaca (bisa dirender di browser).
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do nothing;

-- =====================================================================
-- END Migrasi 0005
-- =====================================================================