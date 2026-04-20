'use client';

import { useMemo, useState } from 'react';
import type { Product } from '../../lib/api';
import productsSeed from '../../products.json';

const normalize = (value: string | number) => String(value).toLowerCase().replace(/\s+/g, '');

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const products = productsSeed as Product[];

  const matched = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];

    return products.filter((p) =>
      normalize(p.name).includes(q) ||
      normalize(p.amount).includes(q) ||
      normalize(p.price).includes(q) ||
      normalize(p.slug).includes(q)
    );
  }, [query, products]);

  return (
    <main style={{ padding: '20px' }}>
      <h1>商品検索</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="商品名・量・価格で検索"
        style={{ width: '100%', maxWidth: 400, padding: 10, fontSize: 16 }}
      />

      <div
        style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 16
        }}
      >
        {query && matched.length === 0 && <p>該当商品なし</p>}

        {matched.map((p) => (
          <div
            key={p.slug}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 10,
              textAlign: 'center',
              background: '#fafafa'
            }}
          >
            <img src={`/assets/${p.image}`} alt={p.name} style={{ width: '100%', height: 120, objectFit: 'contain' }} />
            <h3 style={{ fontSize: 16, margin: '8px 0 4px' }}>{p.name}</h3>
            <div>{p.amount}</div>
            <div style={{ fontWeight: 'bold', marginTop: 4 }}>{p.price}円</div>
          </div>
        ))}
      </div>
    </main>
  );
}
