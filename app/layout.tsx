import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Malibou Chocolate',
    template: '%s — Malibou Chocolate',
  },
  description:
    'Modern Cocoa House — Cita Rasa Kakao dari Ranah Minang. Katalog resmi olahan cokelat, bubuk kakao, cocoa butter, dan koleksi spesial rendang Malibou.',
  applicationName: 'Malibou Chocolate',
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
    title: 'Malibou Chocolate',
    description:
      'Modern Cocoa House — Cita Rasa Kakao dari Ranah Minang. Katalog resmi olahan cokelat, bubuk kakao, cocoa butter, dan koleksi spesial rendang Malibou.',
    type: 'website',
    siteName: 'Malibou Chocolate',
    locale: 'id_ID',
    images: [{ url: '/logo.png', width: 1254, height: 1254, alt: 'Logo Malibou Chocolate' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Malibou Chocolate',
    description:
      'Modern Cocoa House — Cita Rasa Kakao dari Ranah Minang. Katalog resmi olahan cokelat, bubuk kakao, cocoa butter, dan koleksi spesial rendang Malibou.',
    images: ['/logo.png'],
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