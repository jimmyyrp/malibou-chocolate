import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Coklat Malibou — Olahan Cokelat Fermentasi Asli Padang Pariaman',
    template: '%s | Coklat Malibou',
  },
  description:
    'Malibou Chocolate: produsen coklat fermentasi asli Padang Pariaman, Sumatera Barat. Jual cokelat batangan, paralin, bubuk coklat 3in1, cocoa powder, biji kakao, cocoa butter, ball choco & rendang khas Minang — Halal MUI, standar SNI, kirim ke seluruh Indonesia.',
  applicationName: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'o4XklErUVv3htpUgLcPUILnPS9MtvfPHFEtXxbRlQuk',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Coklat Malibou — Olahan Cokelat Fermentasi Asli Padang Pariaman',
    description:
      'Malibou Chocolate: produsen coklat fermentasi asli Padang Pariaman, Sumatera Barat. Jual cokelat batangan, paralin, bubuk coklat 3in1, cocoa powder, biji kakao, cocoa butter, ball choco & rendang khas Minang — Halal MUI, standar SNI.',
    type: 'website',
    siteName: SITE_NAME,
    locale: 'id_ID',
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1254,
        height: 1254,
        alt: 'Logo Malibou Chocolate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coklat Malibou — Olahan Cokelat Fermentasi Asli Padang Pariaman',
    description:
      'Malibou Chocolate: produsen coklat fermentasi asli Padang Pariaman, Sumatera Barat. Jual cokelat batangan, paralin, bubuk coklat 3in1, cocoa powder, biji kakao, cocoa butter & rendang khas Minang.',
    images: [`${SITE_URL}/logo.png`],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F7F1E7] text-[#3A1F14] antialiased selection:bg-[#B87932] selection:text-white">
        {children}
      </body>
    </html>
  );
}