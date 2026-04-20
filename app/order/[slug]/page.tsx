import Link from 'next/link';
import { fetchProductBySlug } from '../../../lib/api';

export const dynamic = 'force-dynamic';

export default async function OrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  return (
    <main>
      <h1>ご注文ありがとうございます！🐦</h1>
      {product ? (
        <>
          <p>
            「<strong>{product.name}</strong>（{product.amount}）」<br />
            を承りました！
          </p>
          <div className="product-images">
            <img src={`/assets/${product.image}`} alt={product.name} style={{ maxWidth: 300 }} />
          </div>
          <p>希望小売価格：{product.price}円</p>
        </>
      ) : (
        <p>不明な商品です。</p>
      )}
      <Link href="/" className="btn">トップへ戻る</Link>
    </main>
  );
}
