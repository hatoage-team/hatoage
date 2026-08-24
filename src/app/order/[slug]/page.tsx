import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { notFound } from 'next/navigation';
import { fetchProductBySlug, getProductImageSrc } from '@/lib/api';

export const revalidate = 60;

export default async function OrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  return (
    <main>
      <h1>ご注文ありがとうございます！</h1>
      <p>「<strong>{product.name}</strong>（{product.amount}）」を承りました！</p>
      <div className="product-images">
        <ProductImage
          className="product-detail-image"
          src={getProductImageSrc(product.image)}
          alt={product.name}
          width={800}
          height={600}
          sizes="(max-width: 768px) 100vw, 500px"
        />
      </div>
      <p>希望小売価格：{product.price}円</p>
      <Link href="/" className="btn">トップへ戻る</Link>
    </main>
  );
}
