import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <div className="concept-image fade-in">
        <img src="/assets/concept.png" alt="コンセプト画像" />
      </div>

      <section className="intro">
        <h1>ようこそ！はとあげマートへ</h1>
        <p>美味しい「はとあげ」を販売する架空のコンビニです。</p>
        <Link href="/products" className="btn">商品一覧を見る</Link>
      </section>
    </main>
  );
}
