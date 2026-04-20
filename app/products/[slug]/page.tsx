import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProductBySlug } from '../../../lib/api';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  return (
    <main>
      <h1 className="fade-in">{product.name} ({product.amount})</h1>
      <p className="fade-in">希望小売価格 : {product.price}円</p>
      <div className="product-images fade-in">
        <img src={`/assets/${product.image}`} alt={product.name} />
      </div>
      <Link href={`/order/${product.slug}`} className="btn fade-in">購入</Link>
      <Link href="/products" className="btn fade-in">商品一覧に戻る</Link>
    </main>
  );
}
