import type { Metadata } from 'next';
import HomePage from '../../src/components/HomePage';
import { JsonLd } from '../../src/components/JsonLd';
import { organizationSchema, websiteSchema } from '../../src/lib/structuredData';

export const metadata: Metadata = {
  title: {
    absolute: 'Coklat Malibou — Olahan Cokelat Fermentasi Asli Padang Pariaman',
  },
  description:
    'Malibou Chocolate: produsen coklat fermentasi asli Padang Pariaman, Sumatera Barat. Beli cokelat batangan, paralin, bubuk coklat 3in1, cocoa powder, biji kakao, cocoa butter, ball choco & rendang khas Minang. Halal MUI, standar SNI, kirim ke seluruh Indonesia.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Coklat Malibou — Olahan Cokelat Fermentasi Asli Padang Pariaman',
    description:
      'Beli cokelat fermentasi asli Padang Pariaman: cokelat batangan, paralin, bubuk coklat 3in1, cocoa powder, biji kakao, cocoa butter & rendang khas Minang. Halal MUI, SNI.',
    url: '/',
    type: 'website',
  },
};

export default function HomeRoute() {
  return (
    <>
      <JsonLd data={[websiteSchema(), organizationSchema()]} />
      <HomePage />
    </>
  );
}