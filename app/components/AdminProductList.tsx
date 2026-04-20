'use client';

import { useState } from 'react';
import type { Product } from '../../lib/api';

type Props = {
  products: Product[];
};

export default function AdminProductList({ products }: Props) {
  const [rows, setRows] = useState(products);
  const [status, setStatus] = useState('');

  const updateField = (slug: string, key: keyof Product, value: string) => {
    setRows((prev) => prev.map((row) => (row.slug === slug ? { ...row, [key]: value } : row)));
  };

  const updateProduct = async (slug: string) => {
    const row = rows.find((item) => item.slug === slug);
    if (!row) return;

    const response = await fetch(`/api/admin/products/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: row.name,
        amount: row.amount,
        price: row.price,
        image: row.image
      })
    });

    const result = await response.json();
    setStatus(response.ok ? '更新しました' : `更新に失敗しました: ${result.message ?? 'unknown error'}`);
  };

  const removeProduct = async (slug: string) => {
    if (!window.confirm('削除する？')) return;

    const response = await fetch(`/api/admin/products/${slug}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    if (!response.ok) {
      setStatus(`削除に失敗しました: ${result.message ?? 'unknown error'}`);
      return;
    }

    setRows((prev) => prev.filter((row) => row.slug !== slug));
    setStatus('削除しました');
  };

  return (
    <section>
      <h2>登録済み商品</h2>
      {status && <p>{status}</p>}

      {rows.map((p) => (
        <div key={p.slug} style={{ marginBottom: '8px' }}>
          <input value={p.name} onChange={(e) => updateField(p.slug, 'name', e.target.value)} />
          <input value={p.amount} onChange={(e) => updateField(p.slug, 'amount', e.target.value)} />
          <input value={String(p.price)} onChange={(e) => updateField(p.slug, 'price', e.target.value)} />
          <input value={p.image} onChange={(e) => updateField(p.slug, 'image', e.target.value)} />
          <button onClick={() => updateProduct(p.slug)}>更新</button>
          <button onClick={() => removeProduct(p.slug)}>削除</button>
        </div>
      ))}
    </section>
  );
}
