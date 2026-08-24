import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';

export default function HomePage() {
  return (
    <main>
      <FadeIn>
        <div className="concept-image">
          <Image
            src="/assets/concept.png"
            alt="はとあげマートのコンセプト画像"
            width={1200}
            height={675}
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        </div>
      </FadeIn>

      <Link href="/search" className="btn">商品検索</Link>

      <FadeIn>
        <section className="intro">
          <h1>ようこそ！はとあげマートへ</h1>
          <p>美味しい「はとあげ」を販売する架空のコンビニです。</p>
          <Link href="/products" className="btn">商品一覧を見る</Link>
        </section>
      </FadeIn>
    </main>
  );
}
