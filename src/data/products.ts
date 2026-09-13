import { Product } from '../types';

export const OFFICIAL_WHATSAPP_NUMBER = '6282283569177';
export const BRAND_NAME = 'Malibou Chocolate';
export const BRAND_TAGLINE = 'From Cocoa to Chocolate';
export const BRAND_SUBTITLE = 'Cita Rasa Kakao dari Ranah Minang';

export const CATEGORIES: { id: string; name: string; icon: string; count: number; description: string }[] = [
  {
    id: 'chocolate-bar',
    name: 'Coklat Batangan',
    icon: '🍫',
    count: 4,
    description: 'Coklat batangan dengan kemurnian kakao pilihan dan sentuhan rempah lokal.'
  },
  {
    id: 'praline-snack',
    name: 'Paralin',
    icon: '🍬',
    count: 4,
    description: 'Coklat paralin kemasan pouch, kotak, dan botol untuk camilan dan bingkisan istimewa.'
  },
  {
    id: 'chocolate-drink',
    name: 'Minuman Coklat',
    icon: '🥤',
    count: 4,
    description: 'Minuman cokelat 3in1 creamy dan sachet siap seduh hangat maupun dingin.'
  },
  {
    id: 'cocoa-ingredients',
    name: 'Cocoa',
    icon: '🌱',
    count: 7,
    description: 'Bahan baku kakao murni dari bubuk kakao, biji fermentasi, hingga cocoa butter asli.'
  },
  {
    id: 'ball-choco',
    name: 'Ball Choco',
    icon: '🍩',
    count: 1,
    description: 'Bola-bola cokelat renyah berlapis cokelat manis untuk camilan ringan.'
  },
  {
    id: 'rendang',
    name: 'Rendang',
    icon: '🍛',
    count: 10,
    description: 'Rendang khas Minang otentik berpadu racikan bumbu rempah dan sentuhan kakao Malibou.'
  },
];

export const PRODUCTS: Product[] = [
  // 01 - Coklat Batangan
  {
    id: 1,
    code: 'PRD001',
    name: 'Coklat Batangan 70%',
    category: 'chocolate-bar',
    categoryName: 'Coklat Batangan',
    price: 35000,
    unit: 'pcs',
    description: 'Coklat batangan dark premium 70% dari biji kakao Sumatera Barat. Tekstur halus, aroma pekat, dan keseimbangan manis-pahit yang elegan.',
    imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 2,
    code: 'PRD002',
    name: 'Coklat Batangan 80%',
    category: 'chocolate-bar',
    categoryName: 'Coklat Batangan',
    price: 35000,
    unit: 'pcs',
    description: 'Kadar kakao 80% dengan karakter pekat dan aftertaste panjang bagi pecinta dark chocolate sejati.',
    imageUrl: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    code: 'PRD003',
    name: 'Coklat Batangan 100% (Dark Chocolate)',
    category: 'chocolate-bar',
    categoryName: 'Coklat Batangan',
    price: 45000,
    unit: 'pcs',
    description: 'Kemurnian 100% pasta kakao tanpa gula. Rasa autentik dan aroma tanah khas kakao Ranah Minang yang utuh dan alami.',
    imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 4,
    code: 'PRD004',
    name: 'Coklat Batangan Balado',
    category: 'chocolate-bar',
    categoryName: 'Coklat Batangan',
    price: 35000,
    unit: 'pcs',
    description: 'Inovasi khas Ranah Minang yang memadukan kelembutan cokelat pekat Malibou dengan sensasi hangat rempah balado yang unik dan menggoda.',
    imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=800&q=80'
  },

  // 02 - Paralin
  {
    id: 5,
    code: 'PRD005',
    name: 'Coklat Paralin Pouch',
    category: 'praline-snack',
    categoryName: 'Paralin',
    price: 35000,
    unit: 'pouch',
    description: 'Butiran coklat paralin lembut dengan isian lezat dalam kemasan pouch zipper kedap udara, cocok untuk camilan harian.',
    imageUrl: 'https://images.unsplash.com/photo-1575372587186-500e391493b8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    code: 'PRD006',
    name: 'Coklat Paralin Kotak',
    category: 'praline-snack',
    categoryName: 'Paralin',
    price: 100000,
    unit: 'box',
    description: 'Praline cokelat aneka bentuk dan tekstur dalam balutan gift box eksklusif. Pilihan sempurna untuk bingkisan spesial dan oleh-oleh premium.',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 7,
    code: 'PRD007',
    name: 'Coklat Paralin Botol Besar',
    category: 'praline-snack',
    categoryName: 'Paralin',
    price: 130000,
    unit: 'botol',
    description: 'Pralin renyah dalam kemasan botol toples besar segel rapat yang menjaga tekstur renyah dan kesegaran cokelat lebih lama.',
    imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 8,
    code: 'PRD008',
    name: 'Coklat Paralin Botol Kecil',
    category: 'praline-snack',
    categoryName: 'Paralin',
    price: 130000,
    unit: 'botol',
    description: 'Pralin renyah porsi kecil dalam botol toples, praktis untuk oleh-oleh dan camilan harian.',
    imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800&q=80'
  },

  // 03 - Minuman Coklat
  {
    id: 9,
    code: 'PRD009',
    name: 'Coklat 3in1 300gr',
    category: 'chocolate-drink',
    categoryName: 'Minuman Coklat',
    price: 65000,
    unit: 'pack',
    weight: '300gr',
    description: 'Serbuk minuman coklat 3in1 dengan perpaduan kakao asli, krimer lembut, dan manis seimbang. Praktis diseduh air panas atau disajikan dingin dengan es batu.',
    imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 10,
    code: 'PRD010',
    name: 'Coklat 3in1 500gr',
    category: 'chocolate-drink',
    categoryName: 'Minuman Coklat',
    price: 100000,
    unit: 'pack',
    weight: '500gr',
    description: 'Kemasan sedang 500 gram bubuk minuman cokelat 3in1 untuk persediaan keluarga. Rasa cokelat lebih mantap dan creamy.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 11,
    code: 'PRD011',
    name: 'Coklat 3in1 1000gr',
    category: 'chocolate-drink',
    categoryName: 'Minuman Coklat',
    price: 120000,
    unit: 'pack',
    weight: '1000gr (1 kg)',
    description: 'Kemasan ekonomis 1 kg bubuk minuman coklat 3in1 Malibou. Cocok untuk kebutuhan usaha kedai kopi, kafe, ataupun konsumsi rutin keluarga.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 12,
    code: 'PRD012',
    name: 'Malicho Drink Sachet',
    category: 'chocolate-drink',
    categoryName: 'Minuman Coklat',
    price: 40000,
    unit: 'renteng',
    description: 'Sachet individual minuman cokelat siap seduh praktis dibawa bepergian, ke kantor, atau santai di mana saja.',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80'
  },

  // 04 - Cocoa
  {
    id: 13,
    code: 'PRD013',
    name: 'Cocoa Powder 300gr',
    category: 'cocoa-ingredients',
    categoryName: 'Cocoa',
    price: 125000,
    unit: 'pack',
    weight: '300gr',
    description: 'Bubuk kakao murni kualitas pilihan berkarakter aroma kuat dan warna cokelat gelap alami. Sangat cocok untuk olahan baking, kue, pastry, dan minuman cokelat spesial.',
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 14,
    code: 'PRD014',
    name: 'Cocoa Powder 1000gr',
    category: 'cocoa-ingredients',
    categoryName: 'Cocoa',
    price: 400000,
    unit: 'pack',
    weight: '1000gr (1 kg)',
    description: 'Kemasan 1 kg bubuk kakao murni untuk skala produksi bakery, patisserie, industri rumahan, maupun kreasi kuliner profesional.',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 15,
    code: 'PRD015',
    name: 'Biji Kakao 250gr',
    category: 'cocoa-ingredients',
    categoryName: 'Cocoa',
    price: 250000,
    unit: 'pack',
    weight: '250gr',
    description: 'Biji kakao kering fermentasi hasil budidaya perkebunan kakao Sumatera Barat. Siap untuk proses sangrai (roasting), nibs, atau olahan cokelat murni.',
    imageUrl: 'https://images.unsplash.com/photo-1620802051782-725fa33db162?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 16,
    code: 'PRD016',
    name: 'Cocoa Butter 250gr',
    category: 'cocoa-ingredients',
    categoryName: 'Cocoa',
    price: 250000,
    unit: 'pack',
    weight: '250gr',
    description: 'Lemak kakao alami (cocoa butter murni) berkualitas tinggi dengan aroma kakao lembut, cocok untuk tempering cokelat couverture, resep patisserie, maupun perawatan alami.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 17,
    code: 'PRD017',
    name: 'Cocoa Butter 1000gr',
    category: 'cocoa-ingredients',
    categoryName: 'Cocoa',
    price: 500000,
    unit: 'pack',
    weight: '1000gr (1 kg)',
    description: 'Lemak kakao murni kemasan bulk 1 kg untuk kebutuhan chocolatiers, pengrajin makanan manis, dan industri kuliner.',
    imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 18,
    code: 'PRD029',
    name: 'Cocoa Powder 50gr',
    category: 'cocoa-ingredients',
    categoryName: 'Cocoa',
    price: 25000,
    unit: 'gram',
    weight: '50gr',
    description: 'Bubuk kakao murni porsi 50 gram untuk uji coba dan kreasi kecil rumahan.',
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 19,
    code: 'PRD030',
    name: 'Cocoa Powder 100gr',
    category: 'cocoa-ingredients',
    categoryName: 'Cocoa',
    price: 45000,
    unit: 'gram',
    weight: '100gr',
    description: 'Bubuk kakao murni porsi 100 gram untuk kebutuhan baking rumahan yang praktis.',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80'
  },

  // 05 - Ball Choco
  {
    id: 20,
    code: 'PRD018',
    name: 'Ball Choco Pouch',
    category: 'ball-choco',
    categoryName: 'Ball Choco',
    price: 15000,
    unit: 'pouch',
    description: 'Bola-bola cokelat renyah (chocolate balls) berlapis cokelat manis yang meleleh lembut di mulut saat dikunyah.',
    imageUrl: 'https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?auto=format&fit=crop&w=800&q=80'
  },

  // 06 - Rendang
  {
    id: 21,
    code: 'PRD019',
    name: 'Rendang Coklat Daging 250gr',
    category: 'rendang',
    categoryName: 'Rendang',
    price: 95000,
    unit: 'pack',
    weight: '250gr',
    description: 'Inovasi kuliner khas Malibou: perpaduan daging sapi pilihan yang dimasak perlahan dengan bumbu rempah rendang Minang dan sentuhan kakao Malibou yang legit serta gurih harum.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 22,
    code: 'PRD020',
    name: 'Rendang Daging 100gr (Sachet)',
    category: 'rendang',
    categoryName: 'Rendang',
    price: 30000,
    unit: 'pack',
    weight: '100gr',
    description: 'Rendang daging sapi tradisional Minangkabau dengan bumbu rempah pekat meresap, kemasan personal 100 gram siap santap dan praktis dibawa bepergian.',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 23,
    code: 'PRD021',
    name: 'Rendang Forkids 200gr',
    category: 'rendang',
    categoryName: 'Rendang',
    price: 85000,
    unit: 'pack',
    weight: '200gr',
    description: 'Rendang daging sapi dengan tekstur sangat empuk dan bumbu ramah anak tanpa rasa pedas menyengat, kaya gizi dan disukai si kecil.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 24,
    code: 'PRD022',
    name: 'Rendang Coklat Paru 250gr',
    category: 'rendang',
    categoryName: 'Rendang',
    price: 95000,
    unit: 'pack',
    weight: '250gr',
    description: 'Olahan paru sapi renyah gurih berpadu racikan rempah rendang dan sentuhan kakao Malibou yang khas, tekstur khas dan gurih mantap.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 25,
    code: 'PRD023',
    name: 'Rendang Paru 100gr (Sachet)',
    category: 'rendang',
    categoryName: 'Rendang',
    price: 30000,
    unit: 'pack',
    weight: '100gr',
    description: 'Rendang paru sapi gurih dengan rempah Minang otentik dalam porsi personal 100 gram.',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 26,
    code: 'PRD024',
    name: 'Rendang Jengkol 250gr',
    category: 'rendang',
    categoryName: 'Rendang',
    price: 65000,
    unit: 'pack',
    weight: '250gr',
    description: 'Rendang jengkol pilihan yang pulen dan empuk dengan racikan bumbu rendang Minangkabau yang pekat, tidak langu dan kaya rasa rempah kelapa.',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 27,
    code: 'PRD025',
    name: 'Rendang Nangka 250gr',
    category: 'rendang',
    categoryName: 'Rendang',
    price: 55000,
    unit: 'pack',
    weight: '250gr',
    description: 'Rendang cubadak (nangka muda) khas Ranah Minang yang dimasak santan kental rempah hingga meresap ke dalam serat nangka yang lembut.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 28,
    code: 'PRD026',
    name: 'Rendang Nangka 100gr (Sachet)',
    category: 'rendang',
    categoryName: 'Rendang',
    price: 10000,
    unit: 'pack',
    weight: '100gr',
    description: 'Rendang nangka muda (cubadak) porsi ekonomis 100 gram dengan keaslian bumbu rendang santan kelapa khas Padang Pariaman.',
    imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 29,
    code: 'PRD027',
    name: 'Bumbung Rendang 250gr',
    category: 'rendang',
    categoryName: 'Rendang',
    price: 45000,
    unit: 'pcs',
    weight: '250gr',
    description: 'Bumbung rendang khas Minang berupa bumbu rendang lengkap siap olah, praktis dan cita rasa otentik Padang Pariaman.',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 30,
    code: 'PRD028',
    name: 'Bumbung Rendang 100gr',
    category: 'rendang',
    categoryName: 'Rendang',
    price: 20000,
    unit: 'pcs',
    weight: '100gr',
    description: 'Bumbung rendang ukuran 100 gram untuk porsi keluarga kecil dan stok dapur praktis.',
    imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80'
  },
];

export const formatRupiah = (number: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
};