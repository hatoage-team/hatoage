import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ textAlign: 'center', padding: '60px', color: '#000' }}>
      <h1 className="fade-in">404 🐦</h1>
      <p className="fade-in">
        ページが見つかりませんでした。<br />
        URLが間違っているか、商品が終了した可能性があります。
      </p>
      <div style={{ marginTop: '30px' }}>
        <Link href="/" className="btn">トップへ戻る</Link>
        <Link href="/products" className="btn">商品一覧を見る</Link>
      </div>
    </main>
  );
}
