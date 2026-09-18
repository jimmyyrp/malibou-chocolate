export const SITE_NAME = 'Malibou Chocolate';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
  'https://www.malibou-chocolate.web.id';

export const SITE_TAGLINE = 'From Cocoa to Chocolate';
export const SITE_SUBTITLE = 'Cita Rasa Kakao dari Ranah Minang';

export const OFFICIAL_WHATSAPP_NUMBER = '6288271242670';
export const OFFICIAL_PHONE_DISPLAY = '0882-7124-2670';

export const BUSINESS = {
  name: SITE_NAME,
  legalName: 'CV Nauli Perdana',
  tagline: SITE_TAGLINE,
  subtitle: SITE_SUBTITLE,
  description:
    'Coklat Malibou — produsen olahan cokelat fermentasi asli Padang Pariaman, Sumatera Barat. Bengkel cokelat, cafe & gallery dengan produk cokelat batangan, paralin, bubuk coklat 3in1, cocoa powder, biji kakao, cocoa butter, ball choco, hingga rendang khas Minang. Tersertifikasi Halal MUI dan berstandar SNI.',
  priceRange: 'Rp 10.000 - Rp 500.000',
  currency: 'IDR',
  address: {
    streetAddress: 'Kawasan Wisata Malibou Anai, Guguak',
    addressLocality: 'Kec. 2 x 11 Kayu Tanam',
    addressRegion: 'Kabupaten Padang Pariaman, Sumatera Barat',
    postalCode: '25584',
    addressCountry: 'ID',
  },
  phone: `+${OFFICIAL_WHATSAPP_NUMBER}`,
  hours: 'Senin–Minggu, 08.00–21.00 WIB',
  instagram: 'https://www.instagram.com/malibouchocolate.id',
} as const;

export const OPENING_HOURS = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ],
  opens: '08:00',
  closes: '21:00',
};