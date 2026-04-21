import Link from 'next/link';
import FadeIn from './components/FadeIn'; // パスは適宜調整してください

export default function HomePage() {
  return (
    <main>
      {/* 画像をフェードイン */}
      <FadeIn>
        <div className="concept-image fade-in">
          <img src="/assets/concept.png" alt="コンセプト画像" />
        </div>
      </FadeIn>

      <Link href="/search" className="btn">商品検索</Link>

      {/* セクション全体をまとめてフェードイン */}
      <FadeIn>
        <section className="intro fade-in">
          <h1>ようこそ！はとあげマートへ</h1>
          <p>美味しい「はとあげ」を販売する架空のコンビニです。</p>
          <Link href="/products" className="btn">商品一覧を見る</Link>
        </section>
      </FadeIn>
    </main>
  );
}
