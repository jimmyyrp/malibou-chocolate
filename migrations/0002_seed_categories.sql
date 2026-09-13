-- =====================================================================
-- Malibou Chocolate — Migration 0002: Seed Kategori
-- =====================================================================

insert into public.categories (id, name, icon, description, sort_order) values
    ('chocolate-bar',      'Coklat Batangan',  '🍫', 'Coklat batangan dengan kemurnian kakao pilihan dan sentuhan rempah lokal.', 1),
    ('praline-snack',      'Paralin',          '🍬', 'Coklat paralin kemasan pouch, kotak, dan botol untuk camilan dan bingkisan istimewa.', 2),
    ('chocolate-drink',    'Minuman Coklat',   '🥤', 'Minuman cokelat 3in1 creamy dan sachet siap seduh hangat maupun dingin.', 3),
    ('cocoa-ingredients',  'Cocoa',            '🌱', 'Bahan baku kakao murni dari bubuk kakao, biji fermentasi, hingga cocoa butter asli.', 4),
    ('ball-choco',         'Ball Choco',       '🍩', 'Bola-bola cokelat renyah berlapis cokelat manis untuk camilan ringan.', 5),
    ('rendang',            'Rendang',          '🍛', 'Rendang khas Minang otentik berpadu racikan bumbu rempah dan sentuhan kakao Malibou.', 6)
on conflict (id) do update set
    name        = excluded.name,
    icon        = excluded.icon,
    description = excluded.description,
    sort_order  = excluded.sort_order;

-- =====================================================================
-- END Migrasi 0002
-- =====================================================================