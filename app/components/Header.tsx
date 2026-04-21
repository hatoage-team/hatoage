'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // メニューを閉じる処理（リンククリック時など）
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="header">
      <div className="logo">
        <Link href="/" onClick={() => setIsOpen(false)}>
          <img src="/assets/logo.png" alt="はとあげマート" />
        </Link>
      </div>

      {/* ハンバーガーボタン（スマホのみ表示） */}
      <button className={`menu-trigger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* ナビゲーション */}
      <nav className={`nav ${isOpen ? 'open' : ''}`}>
        <ul>
          <li><Link href="/" onClick={toggleMenu}>ホーム</Link></li>
          <li><Link href="/products" onClick={toggleMenu}>商品一覧</Link></li>
          <li><Link href="/search" onClick={toggleMenu}>商品検索</Link></li>
          <li><Link href="/news" onClick={toggleMenu}>ニュース</Link></li>
          <li><Link href="https://religion.hatoage.wata777.f5.si/" onClick={toggleMenu}>はとあげ教</Link></li>
        </ul>
      </nav>

      {/* 背景クリックで閉じるためのオーバーレイ（スマホ時のみ） */}
      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </header>
  );
}
