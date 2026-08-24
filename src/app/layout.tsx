import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://hatoage.wata777.f5.si'),
  title: {
    default: 'はとあげマート',
    template: '%s | はとあげマート'
  },
  description: '美味しいはとあげを出来たてで提供する架空のコンビニ公式サイト。',
  icons: {
    icon: '/assets/favicon.ico'
  },
  manifest: '/manifest.webmanifest'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#007acc'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
