import productsSeed from '../products.json';
import newsSeed from '../news.json';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://hatoage.wata777.workers.dev';

export type Product = {
  slug: string;
  name: string;
  amount: string;
  price: number | string;
  image: string;
};

export type News = {
  uuid?: string;
  id?: string;
  date: string;
  title: string;
  body?: string;
  content?: string;
  description?: string;
  text?: string;
};

export const normalizeNews = (item: News) => ({
  ...item,
  body: item.body || item.content || item.description || item.text || '本文は準備中です。'
});

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`products fetch failed: ${res.status}`);
    return await res.json();
  } catch {
    return productsSeed as Product[];
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`product fetch failed: ${res.status}`);
    return await res.json();
  } catch {
    const item = (productsSeed as Product[]).find((p) => p.slug === slug);
    return item ?? null;
  }
}

export async function fetchNewsList(): Promise<News[]> {
  try {
    const res = await fetch(`${API_BASE}/news`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`news fetch failed: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizeNews) : [];
  } catch {
    return (newsSeed as News[]).map(normalizeNews);
  }
}

export async function fetchNewsByUuid(uuid: string): Promise<News | null> {
  try {
    const res = await fetch(`${API_BASE}/news/${uuid}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`news detail fetch failed: ${res.status}`);
    const data = await res.json();
    return normalizeNews(data);
  } catch {
    const item = (newsSeed as News[]).find((n) => n.uuid === uuid || n.id === uuid);
    return item ? normalizeNews(item) : null;
  }
}
