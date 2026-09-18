import type { Metadata } from 'next';
import KontakPage from '../../../src/components/KontakPage';
import { JsonLd } from '../../../src/components/JsonLd';
import { localBusinessSchema } from '../../../src/lib/structuredData';

export const metadata: Metadata = {
  title: 'Kontak & Alamat Coklat Malibou — Padang Pariaman, Sumatera Barat',
  description:
    'Hubungi Malibou Chocolate Padang Pariaman: WhatsApp 0882-7124-2670, alamat Kawasan Malibou Anai Padang Pariaman, jam layanan Senin–Minggu 08.00–21.00 WIB. Pesan cokelat fermentasi, cocoa powder, dan rendang khas Minang.',
  alternates: {
    canonical: '/kontak',
  },
  openGraph: {
    title: 'Kontak Coklat Malibou — Padang Pariaman, Sumatera Barat',
    description:
      'WhatsApp 0882-7124-2670 · Kawasan Malibou Anai, Padang Pariaman, Sumatera Barat · Senin–Minggu 08.00–21.00 WIB.',
    url: '/kontak',
    type: 'website',
  },
};

export default function KontakRoute() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <KontakPage />
    </>
  );
}