import type { Metadata } from 'next';
import KatalogPage from '../../../src/components/KatalogPage';
import { JsonLd } from '../../../src/components/JsonLd';
import { itemListSchema } from '../../../src/lib/structuredData';
import { PRODUCTS } from '../../../src/data/products';

export const metadata: Metadata = {
  title: 'Katalog Coklat Malibou — 30+ Produk Cokelat, Cocoa & Rendang Padang Pariaman',
  description:
    'Katalog lengkap coklat Malibou Padang Pariaman: cokelat batangan, paralin, bubuk coklat 3in1, malicho drink, cocoa powder, biji kakao fermentasi, cocoa butter, ball choco, dan rendang khas Minang. Halal MUI & standar SNI.',
  alternates: {
    canonical: '/katalog',
  },
  openGraph: {
    title: 'Katalog Coklat Malibou — Cokelat Fermentasi Padang Pariaman',
    description:
      'Jelajahi katalog resmi coklat Malibou: cokelat batangan, paralin, bubuk coklat 3in1, cocoa powder, biji kakao, cocoa butter, ball choco, dan rendang khas Minang.',
    url: '/katalog',
    type: 'website',
  },
};

export default function KatalogRoute() {
  return (
    <>
      <JsonLd data={itemListSchema(PRODUCTS)} />
      <KatalogPage />
    </>
  );
}