-- 0007_remove_product_code.sql
-- Hapus kolom "code" (kode produk lama, mis. PRD001) dari tabel products.
-- Sejak migrasi 0006, id integer sudah menjadi identitas utama produk dan
-- aplikasi tidak lagi memakai kolom code. Konstraint unik kolom code ikut
-- dihapus otomatis bersama kolomnya.

alter table public.products
  drop column if exists code;