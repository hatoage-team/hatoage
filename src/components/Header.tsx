'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'ホーム' },
  { href: '/products', label: '商品一覧' },
  { href: '/search', label: '商品検索' },
  { href: '/news', label: 'ニュース' },
  { href: '/mail', label: 'メール登録' },
  { href: 'https://religion.hatoage.wata777.f5.si/', label: 'はとあげ教', external: true }
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <header className="site-header">
      <div className="logo">
        <Link href="/" aria-label="はとあげマート ホーム" onClick={() => setIsOpen(false)}>
          <Image src="/assets/logo.png" alt="はとあげマート" width={180} height={50} priority />
        </Link>
      </div>

      <button
        type="button"
        className={`menu-trigger ${isOpen ? 'active' : ''}`}
        aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={isOpen}
        aria-controls="site-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span /><span /><span />
      </button>

      <nav id="site-navigation" className={`site-nav ${isOpen ? 'open' : ''}`} aria-label="メインナビゲーション">
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              {link.external ? (
                <a href={link.href} target="_blank" rel="noreferrer" onClick={() => setIsOpen(false)}>{link.label}</a>
              ) : (
                <Link href={link.href} onClick={() => setIsOpen(false)}>{link.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {isOpen && <button type="button" className="overlay" aria-label="メニューを閉じる" onClick={() => setIsOpen(false)} />}
    </header>
  );
}
