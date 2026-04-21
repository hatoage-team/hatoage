import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: 'はとあげマート',
  description: '美味しいはとあげを出来たてで提供する架空のコンビニ公式サイト。'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(() => console.log('🐦 SW registered'))
                  .catch(err => console.error('SW failed', err));
              });
            }
          `}
        </Script>
        <Footer />
      </body>
    </html>
  );
}
