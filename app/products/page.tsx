import Link from 'next/link';
import { fetchProducts } from '../../lib/api';
import FadeIn from '../components/FadeIn'; // 先ほど作成したコンポーネント

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <main>
      {/* H1をフェードイン */}
      <FadeIn>
        <h1>商品一覧</h1>
      </FadeIn>

      <div className="product-list">
        {products.length === 0 && (
          <FadeIn>
            <p className="fade-in">現在、商品はありません。</p>
          </FadeIn>
        )}

        {products.map((p) => (
          /* 商品カードごとにフェードインを適用 */
          <FadeIn key={p.slug}>
            <div className="product">
              <img src={`/assets/${p.image}`} alt={p.name} />
              <h2>{p.name} ({p.amount})</h2>
              <p>希望小売価格: {p.price}円</p>
              <Link href={`/products/${p.slug}`} className="btn">詳細を見る</Link>
            </div>
          </FadeIn>
        ))}
      </div>
    </main>
  );
}
