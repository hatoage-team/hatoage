import AdminProductList from '../components/AdminProductList';
import { fetchProducts } from '../../lib/api';

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const products = await fetchProducts();

  return (
    <main style={{ padding: '20px' }}>
      <h1>管理画面</h1>
      {status && <p style={{ color: '#1b5e20' }}>{status}</p>}

      <h2>商品追加</h2>
      <form method="POST" action="/api/admin/products">
        <input name="slug" placeholder="slug" required />
        <input name="name" placeholder="商品名" required />
        <input name="amount" placeholder="量" />
        <input name="price" type="number" placeholder="価格" />
        <input name="image" placeholder="画像path(full)" />
        <button type="submit">追加</button>
      </form>

      <hr />

      <h2>ニュース追加</h2>
      <form method="POST" action="/api/admin/news">
        <input name="date" type="date" required />
        <input name="title" placeholder="ニュースタイトル" required />
        <input name="body" placeholder="本文" required />
        <button type="submit">追加</button>
      </form>

      <hr />
      <AdminProductList products={products} />
    </main>
  );
}
