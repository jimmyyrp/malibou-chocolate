-- =====================================================================
-- Malibou Chocolate — Migration 0003: Seed 30 Produk
-- -------------------------------------------------------------
-- Data awal persis dengan katalog bawaan src/data/products.ts.
-- sort_order disusun berurutan per kategori agar tampilan storefront
-- tetap mengelompok per kategori.
-- =====================================================================

insert into public.products
    (id, code, name, category_id, price, unit, weight, description, image_url, featured, sort_order)
values
    -- 01 · Coklat Batangan (chocolate-bar)
    ('prd001', 'PRD001', 'Coklat Batangan 70%', 'chocolate-bar', 35000, 'pcs', null,
     'Coklat batangan dark premium 70% dari biji kakao Sumatera Barat. Tekstur halus, aroma pekat, dan keseimbangan manis-pahit yang elegan.',
     'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80', true, 1),
    ('prd002', 'PRD002', 'Coklat Batangan 80%', 'chocolate-bar', 35000, 'pcs', null,
     'Kadar kakao 80% dengan karakter pekat dan aftertaste panjang bagi pecinta dark chocolate sejati.',
     'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80', false, 2),
    ('prd003', 'PRD003', 'Coklat Batangan 100% (Dark Chocolate)', 'chocolate-bar', 45000, 'pcs', null,
     'Kemurnian 100% pasta kakao tanpa gula. Rasa autentik dan aroma tanah khas kakao Ranah Minang yang utuh dan alami.',
     'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80', true, 3),
    ('prd004', 'PRD004', 'Coklat Batangan Balado', 'chocolate-bar', 35000, 'pcs', null,
     'Inovasi khas Ranah Minang yang memadukan kelembutan cokelat pekat Malibou dengan sensasi hangat rempah balado yang unik dan menggoda.',
     'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=800&q=80', false, 4),

    -- 02 · Paralin (praline-snack)
    ('prd005', 'PRD005', 'Coklat Paralin Pouch', 'praline-snack', 35000, 'pouch', null,
     'Butiran coklat paralin lembut dengan isian lezat dalam kemasan pouch zipper kedap udara, cocok untuk camilan harian.',
     'https://images.unsplash.com/photo-1575372587186-500e391493b8?auto=format&fit=crop&w=800&q=80', false, 5),
    ('prd006', 'PRD006', 'Coklat Paralin Kotak', 'praline-snack', 100000, 'box', null,
     'Praline cokelat aneka bentuk dan tekstur dalam balutan gift box eksklusif. Pilihan sempurna untuk bingkisan spesial dan oleh-oleh premium.',
     'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80', false, 6),
    ('prd007', 'PRD007', 'Coklat Paralin Botol Besar', 'praline-snack', 130000, 'botol', null,
     'Pralin renyah dalam kemasan botol toples besar segel rapat yang menjaga tekstur renyah dan kesegaran cokelat lebih lama.',
     'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800&q=80', false, 7),
    ('prd008', 'PRD008', 'Coklat Paralin Botol Kecil', 'praline-snack', 130000, 'botol', null,
     'Pralin renyah porsi kecil dalam botol toples, praktis untuk oleh-oleh dan camilan harian.',
     'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800&q=80', false, 8),

    -- 03 · Minuman Coklat (chocolate-drink)
    ('prd009', 'PRD009', 'Coklat 3in1 300gr', 'chocolate-drink', 65000, 'pack', '300gr',
     'Serbuk minuman coklat 3in1 dengan perpaduan kakao asli, krimer lembut, dan manis seimbang. Praktis diseduh air panas atau disajikan dingin dengan es batu.',
     'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80', true, 9),
    ('prd010', 'PRD010', 'Coklat 3in1 500gr', 'chocolate-drink', 100000, 'pack', '500gr',
     'Kemasan sedang 500 gram bubuk minuman cokelat 3in1 untuk persediaan keluarga. Rasa cokelat lebih mantap dan creamy.',
     'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', false, 10),
    ('prd011', 'PRD011', 'Coklat 3in1 1000gr', 'chocolate-drink', 120000, 'pack', '1000gr (1 kg)',
     'Kemasan ekonomis 1 kg bubuk minuman coklat 3in1 Malibou. Cocok untuk kebutuhan usaha kedai kopi, kafe, ataupun konsumsi rutin keluarga.',
     'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80', false, 11),
    ('prd012', 'PRD012', 'Malicho Drink Sachet', 'chocolate-drink', 40000, 'renteng', null,
     'Sachet individual minuman cokelat siap seduh praktis dibawa bepergian, ke kantor, atau santai di mana saja.',
     'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80', false, 12),

    -- 04 · Cocoa / Bahan Baku (cocoa-ingredients)
    ('prd013', 'PRD013', 'Cocoa Powder 300gr', 'cocoa-ingredients', 125000, 'pack', '300gr',
     'Bubuk kakao murni kualitas pilihan berkarakter aroma kuat dan warna cokelat gelap alami. Sangat cocok untuk olahan baking, kue, pastry, dan minuman cokelat spesial.',
     'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80', true, 13),
    ('prd014', 'PRD014', 'Cocoa Powder 1000gr', 'cocoa-ingredients', 400000, 'pack', '1000gr (1 kg)',
     'Kemasan 1 kg bubuk kakao murni untuk skala produksi bakery, patisserie, industri rumahan, maupun kreasi kuliner profesional.',
     'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80', false, 14),
    ('prd015', 'PRD015', 'Biji Kakao 250gr', 'cocoa-ingredients', 250000, 'pack', '250gr',
     'Biji kakao kering fermentasi hasil budidaya perkebunan kakao Sumatera Barat. Siap untuk proses sangrai (roasting), nibs, atau olahan cokelat murni.',
     'https://images.unsplash.com/photo-1620802051782-725fa33db162?auto=format&fit=crop&w=800&q=80', true, 15),
    ('prd016', 'PRD016', 'Cocoa Butter 250gr', 'cocoa-ingredients', 250000, 'pack', '250gr',
     'Lemak kakao alami (cocoa butter murni) berkualitas tinggi dengan aroma kakao lembut, cocok untuk tempering cokelat couverture, resep patisserie, maupun perawatan alami.',
     'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', false, 16),
    ('prd017', 'PRD017', 'Cocoa Butter 1000gr', 'cocoa-ingredients', 500000, 'pack', '1000gr (1 kg)',
     'Lemak kakao murni kemasan bulk 1 kg untuk kebutuhan chocolatiers, pengrajin makanan manis, dan industri kuliner.',
     'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80', false, 17),
    ('prd029', 'PRD029', 'Cocoa Powder 50gr', 'cocoa-ingredients', 25000, 'gram', '50gr',
     'Bubuk kakao murni porsi 50 gram untuk uji coba dan kreasi kecil rumahan.',
     'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80', false, 18),
    ('prd030', 'PRD030', 'Cocoa Powder 100gr', 'cocoa-ingredients', 45000, 'gram', '100gr',
     'Bubuk kakao murni porsi 100 gram untuk kebutuhan baking rumahan yang praktis.',
     'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80', false, 19),

    -- 05 · Ball Choco (ball-choco)
    ('prd018', 'PRD018', 'Ball Choco Pouch', 'ball-choco', 15000, 'pouch', null,
     'Bola-bola cokelat renyah (chocolate balls) berlapis cokelat manis yang meleleh lembut di mulut saat dikunyah.',
     'https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?auto=format&fit=crop&w=800&q=80', false, 20),

    -- 06 · Rendang (rendang)
    ('prd019', 'PRD019', 'Rendang Coklat Daging 250gr', 'rendang', 95000, 'pack', '250gr',
     'Inovasi kuliner khas Malibou: perpaduan daging sapi pilihan yang dimasak perlahan dengan bumbu rempah rendang Minang dan sentuhan kakao Malibou yang legit serta gurih harum.',
     'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, 21),
    ('prd020', 'PRD020', 'Rendang Daging 100gr (Sachet)', 'rendang', 30000, 'pack', '100gr',
     'Rendang daging sapi tradisional Minangkabau dengan bumbu rempah pekat meresap, kemasan personal 100 gram siap santap dan praktis dibawa bepergian.',
     'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', true, 22),
    ('prd021', 'PRD021', 'Rendang Forkids 200gr', 'rendang', 85000, 'pack', '200gr',
     'Rendang daging sapi dengan tekstur sangat empuk dan bumbu ramah anak tanpa rasa pedas menyengat, kaya gizi dan disukai si kecil.',
     'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', false, 23),
    ('prd022', 'PRD022', 'Rendang Coklat Paru 250gr', 'rendang', 95000, 'pack', '250gr',
     'Olahan paru sapi renyah gurih berpadu racikan rempah rendang dan sentuhan kakao Malibou yang khas, tekstur khas dan gurih mantap.',
     'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', false, 24),
    ('prd023', 'PRD023', 'Rendang Paru 100gr (Sachet)', 'rendang', 30000, 'pack', '100gr',
     'Rendang paru sapi gurih dengan rempah Minang otentik dalam porsi personal 100 gram.',
     'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', false, 25),
    ('prd024', 'PRD024', 'Rendang Jengkol 250gr', 'rendang', 65000, 'pack', '250gr',
     'Rendang jengkol pilihan yang pulen dan empuk dengan racikan bumbu rendang Minangkabau yang pekat, tidak langu dan kaya rasa rempah kelapa.',
     'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', false, 26),
    ('prd025', 'PRD025', 'Rendang Nangka 250gr', 'rendang', 55000, 'pack', '250gr',
     'Rendang cubadak (nangka muda) khas Ranah Minang yang dimasak santan kental rempah hingga meresap ke dalam serat nangka yang lembut.',
     'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', false, 27),
    ('prd026', 'PRD026', 'Rendang Nangka 100gr (Sachet)', 'rendang', 10000, 'pack', '100gr',
     'Rendang nangka muda (cubadak) porsi ekonomis 100 gram dengan keaslian bumbu rendang santan kelapa khas Padang Pariaman.',
     'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80', false, 28),
    ('prd027', 'PRD027', 'Bumbung Rendang 250gr', 'rendang', 45000, 'pcs', '250gr',
     'Bumbung rendang khas Minang berupa bumbu rendang lengkap siap olah, praktis dan cita rasa otentik Padang Pariaman.',
     'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', false, 29),
    ('prd028', 'PRD028', 'Bumbung Rendang 100gr', 'rendang', 20000, 'pcs', '100gr',
     'Bumbung rendang ukuran 100 gram untuk porsi keluarga kecil dan stok dapur praktis.',
     'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80', false, 30)
on conflict (id) do update set
    code        = excluded.code,
    name        = excluded.name,
    category_id = excluded.category_id,
    price       = excluded.price,
    unit        = excluded.unit,
    weight      = excluded.weight,
    description = excluded.description,
    image_url   = excluded.image_url,
    featured    = excluded.featured,
    sort_order  = excluded.sort_order,
    updated_at  = now();

-- =====================================================================
-- END Migrasi 0003
-- =====================================================================