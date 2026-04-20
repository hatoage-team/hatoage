import Link from 'next/link';

export default function Header() {
  return (
    <header>
      <div className="logo">
        <Link href="/">
          <img src="/assets/logo.png" alt="はとあげマート" />
        </Link>
      </div>
      <nav>
        <ul>
          <li><Link href="/">ホーム</Link></li>
          <li><Link href="/products">商品一覧</Link></li>
          <li><Link href="/search">商品検索</Link></li>
          <li><Link href="/news">ニュース</Link></li>
          <li><Link href="/admin">管理画面</Link></li>
        </ul>
      </nav>
    </header>
  );
}
