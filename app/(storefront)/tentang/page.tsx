import type { Metadata } from 'next';
import TentangPage from '../../../src/components/TentangPage';
import { JsonLd } from '../../../src/components/JsonLd';
import { organizationSchema } from '../../../src/lib/structuredData';

export const metadata: Metadata = {
  title: 'Tentang Malibou Chocolate — Produsen Cokelat Fermentasi Padang Pariaman',
  description:
    'Malibou Chocolate (CV Nauli Perdana) adalah produsen olahan cokelat fermentasi asli Padang Pariaman, Sumatera Barat. Kenali sejarah, nilai, dan komitmen kami dalam menghadirkan cokelat Ranah Minang yang Halal MUI dan berstandar SNI.',
  alternates: {
    canonical: '/tentang',
  },
  openGraph: {
    title: 'Tentang Malibou Chocolate — Cokelat Fermentasi Khas Ranah Minang',
    description:
      'Produsen olahan cokelat fermentasi asli Padang Pariaman, Sumatera Barat — Halal MUI, standar SNI.',
    url: '/tentang',
    type: 'website',
  },
};

export default function TentangRoute() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <TentangPage />
    </>
  );
}