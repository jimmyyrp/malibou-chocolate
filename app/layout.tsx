import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Malibou Chocolate',
  description:
    'Modern Cocoa House — Cita Rasa Kakao dari Ranah Minang. Katalog resmi olahan cokelat, bubuk kakao, cocoa butter, dan koleksi spesial rendang Malibou.',
  openGraph: {
    title: 'Malibou Chocolate',
    description:
      'Modern Cocoa House — Cita Rasa Kakao dari Ranah Minang. Katalog resmi olahan cokelat, bubuk kakao, cocoa butter, dan koleksi spesial rendang Malibou.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F7F1E7] text-[#3A1F14] antialiased selection:bg-[#B87932] selection:text-white">
        {children}
      </body>
    </html>
  );
}