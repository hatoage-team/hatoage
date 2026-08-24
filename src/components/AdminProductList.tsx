'use client';

import { useState } from 'react';
import type { Product } from '@/lib/api';

type Props = { products: Product[] };

type DraftProduct = Product & { price: string };

export default function AdminProductList({ products }: Props) {
  const [rows, setRows] = useState<DraftProduct[]>(() =>
    products.map((product) => ({ ...product, price: String(product.price) }))
  );
  const [status, setStatus] = useState('');
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const updateField = (slug: string, key: keyof DraftProduct, value: string) => {
    setRows((prev) => prev.map((row) => row.slug === slug ? { ...row, [key]: value } : row));
  };

  const updateProduct = async (slug: string) => {
    const row = rows.find((item) => item.slug === slug);
    if (!row) return;

    const price = Number(row.price);
    if (!Number.isFinite(price) || price < 0) {
      setStatus('価格は0以上の数値で入力してください。');
      return;
    }

    setBusySlug(slug);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: row.name, amount: row.amount, price, image: row.image })
      });
      const result = await response.json().catch(() => ({}));
      setStatus(response.ok ? '更新しました。' : `更新に失敗しました: ${result.message ?? 'unknown error'}`);
    } catch {
      setStatus('更新に失敗しました。ネットワークを確認してください。');
    } finally {
      setBusySlug(null);
    }
  };

  const removeProduct = async (slug: string) => {
    if (!window.confirm('この商品を削除しますか？')) return;

    setBusySlug(slug);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(`削除に失敗しました: ${result.message ?? 'unknown error'}`);
        return;
      }
      setRows((prev) => prev.filter((row) => row.slug !== slug));
      setStatus('削除しました。');
    } catch {
      setStatus('削除に失敗しました。ネットワークを確認してください。');
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <section>
      <h2>登録済み商品</h2>
      {status && <p role="status">{status}</p>}
      {rows.length === 0 ? <p>商品がありません。</p> : rows.map((product) => (
        <div key={product.slug} className="admin-product-row">
          <input aria-label={`${product.slug} 商品名`} value={product.name} onChange={(e) => updateField(product.slug, 'name', e.target.value)} />
          <input aria-label={`${product.slug} 量`} value={product.amount} onChange={(e) => updateField(product.slug, 'amount', e.target.value)} />
          <input aria-label={`${product.slug} 価格`} type="number" min="0" value={product.price} onChange={(e) => updateField(product.slug, 'price', e.target.value)} />
          <input aria-label={`${product.slug} 画像`} value={product.image} onChange={(e) => updateField(product.slug, 'image', e.target.value)} />
          <button type="button" className="btn" disabled={busySlug !== null} onClick={() => updateProduct(product.slug)}>更新</button>
          <button type="button" className="btn" disabled={busySlug !== null} onClick={() => removeProduct(product.slug)}>削除</button>
        </div>
      ))}
    </section>
  );
}
