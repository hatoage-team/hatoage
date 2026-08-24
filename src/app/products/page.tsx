import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { fetchProducts, getProductImageSrc } from '@/lib/api';
import FadeIn from '@/components/FadeIn';

export const revalidate = 60;

export const metadata = {
  title: '商品一覧',
  description: 'はとあげマートの商品一覧。'
};

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <main>
      <FadeIn><h1>商品一覧</h1></FadeIn>

      {products.length === 0 ? (
        <FadeIn><p>現在、商品はありません。</p></FadeIn>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <FadeIn key={product.slug}>
              <article className="product">
                <ProductImage
                  className="product-image"
                  src={getProductImageSrc(product.image)}
                  alt={product.name}
                  width={360}
                  height={180}
                  sizes="(max-width: 600px) 45vw, 180px"
                />
                <h2>{product.name} ({product.amount})</h2>
                <p>希望小売価格: {product.price}円</p>
                <Link href={`/products/${encodeURIComponent(product.slug)}`} className="btn">詳細を見る</Link>
              </article>
            </FadeIn>
          ))}
        </div>
      )}
    </main>
  );
}
