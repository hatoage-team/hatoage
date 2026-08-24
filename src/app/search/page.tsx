import Link from 'next/link';
import ProductImage from '../components/ProductImage';
import { fetchProducts, getProductImageSrc } from '../../lib/api';

export const revalidate = 60;

export const metadata = {
  title: '商品検索',
  description: 'はとあげマートの商品を商品名・量・価格・slugから検索。'
};

const normalize = (value: string | number) => String(value).toLocaleLowerCase('ja-JP').replace(/\s+/g, '');

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q = '' }, products] = await Promise.all([searchParams, fetchProducts()]);
  const query = q.trim();
  const normalizedQuery = normalize(query);
  const matched = normalizedQuery
    ? products.filter((product) =>
        normalize(product.name).includes(normalizedQuery) ||
        normalize(product.amount).includes(normalizedQuery) ||
        normalize(product.price).includes(normalizedQuery) ||
        normalize(product.slug).includes(normalizedQuery)
      )
    : [];

  return (
    <main className="search-page">
      <h1>商品検索</h1>
      <form method="get" className="search-form">
        <input name="q" defaultValue={query} placeholder="商品名・量・価格で検索" aria-label="商品検索" />
        <button type="submit" className="btn">検索</button>
      </form>

      {!query ? (
        <p>商品名・量・価格などを入力して検索してください。</p>
      ) : matched.length === 0 ? (
        <p>「{query}」に一致する商品はありません。</p>
      ) : (
        <div className="search-grid">
          {matched.map((product) => (
            <article key={product.slug} className="search-card">
              <ProductImage
                className="search-card-image"
                src={getProductImageSrc(product.image)}
                alt={product.name}
                width={240}
                height={120}
                sizes="(max-width: 600px) 45vw, 160px"
              />
              <h2>{product.name}</h2>
              <div>{product.amount}</div>
              <div><strong>{product.price}円</strong></div>
              <Link href={`/products/${encodeURIComponent(product.slug)}`} className="btn">詳細を見る</Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
