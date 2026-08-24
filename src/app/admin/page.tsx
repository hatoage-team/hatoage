import AdminProductList from '@/components/AdminProductList';
import { fetchProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '管理画面',
  robots: { index: false, follow: false }
};

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ status }, products] = await Promise.all([
    searchParams,
    fetchProducts({ noStore: true })
  ]);

  return (
    <main className="admin-page">
      <h1>管理画面</h1>
      {status && <p className="admin-status" role="status">{status}</p>}

      <h2>商品追加</h2>
      <form method="POST" action="/api/admin/products" className="admin-form">
        <input name="slug" placeholder="slug" required />
        <input name="name" placeholder="商品名" required />
        <input name="amount" placeholder="量" required />
        <input name="price" type="number" min="0" step="1" placeholder="価格" required />
        <input name="image" placeholder="画像ファイル名" required />
        <button type="submit" className="btn">追加</button>
      </form>

      <hr />

      <h2>ニュース追加</h2>
      <form method="POST" action="/api/admin/news" className="admin-form">
        <input name="date" type="date" required />
        <input name="title" placeholder="ニュースタイトル" required />
        <textarea name="body" placeholder="本文" rows={6} required />
        <button type="submit" className="btn">追加</button>
      </form>

      <hr />
      <AdminProductList products={products} />
    </main>
  );
}
