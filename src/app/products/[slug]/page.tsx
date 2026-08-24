import type { Metadata } from 'next';
import Link from 'next/link';
import ProductImage from '../../components/ProductImage';
import { notFound } from 'next/navigation';
import { fetchProductBySlug, fetchProducts, getProductImageSrc } from '../../../lib/api';
import FadeIn from '../../components/FadeIn';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await fetchProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: '商品が見つかりません' };
  return { title: product.name, description: `${product.name}（${product.amount}）の詳細。希望小売価格 ${product.price}円。` };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  return (
    <main>
      <FadeIn>
        <h1>{product.name} ({product.amount})</h1>
        <p>希望小売価格: {product.price}円</p>
        <div className="product-images">
          <ProductImage
            className="product-detail-image"
            src={getProductImageSrc(product.image)}
            alt={product.name}
            width={800}
            height={600}
            sizes="(max-width: 768px) 100vw, 500px"
            priority
          />
        </div>
        <Link href={`/order/${encodeURIComponent(product.slug)}`} className="btn">購入</Link>
        <Link href="/products" className="btn">商品一覧に戻る</Link>
      </FadeIn>
    </main>
  );
}
