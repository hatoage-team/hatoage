import Link from 'next/link';
import { fetchProducts } from '../../lib/api';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <main>
      <h1 className="fade-in">商品一覧</h1>
      <div className="product-list">
        {products.length === 0 && <p className="fade-in">現在、商品はありません。</p>}

        {products.map((p) => (
          <div key={p.slug} className="product fade-in">
            <img src={`/assets/${p.image}`} alt={p.name} />
            <h2>{p.name} ({p.amount})</h2>
            <p>希望小売価格: {p.price}円</p>
            <Link href={`/products/${p.slug}`} className="btn">詳細を見る</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
