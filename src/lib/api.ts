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
  id?: string | number;
  date: string;
  title: string;
  body?: string;
  content?: string;
  description?: string;
  text?: string;
};

export const normalizeNews = (item: News): News & { body: string } => ({
  ...item,
  body: item.body || item.content || item.description || item.text || '本文は準備中です。'
});

const seedProducts = productsSeed as Product[];
const seedNews = newsSeed as News[];

type FetchOptions = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

async function fetchJson<T>(path: string, init?: FetchOptions): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchProducts(options?: { noStore?: boolean }): Promise<Product[]> {
  try {
    const data = await fetchJson<Product[]>('/products', options?.noStore
      ? { cache: 'no-store' }
      : { next: { revalidate: 60, tags: ['products'] } });
    return Array.isArray(data) ? data : seedProducts;
  } catch {
    return seedProducts;
  }
}

export async function fetchProductBySlug(
  slug: string,
  options?: { noStore?: boolean }
): Promise<Product | null> {
  try {
    const product = await fetchJson<Product>(`/products/${encodeURIComponent(slug)}`, options?.noStore
      ? { cache: 'no-store' }
      : { next: { revalidate: 60, tags: ['products', `product:${slug}`] } });
    return product ?? null;
  } catch {
    return seedProducts.find((product) => product.slug === slug) ?? null;
  }
}

export async function fetchNewsList(options?: { noStore?: boolean }): Promise<News[]> {
  try {
    const data = await fetchJson<News[]>('/news', options?.noStore
      ? { cache: 'no-store' }
      : { next: { revalidate: 60, tags: ['news'] } });
    return Array.isArray(data) ? data.map(normalizeNews) : [];
  } catch {
    return seedNews.map(normalizeNews);
  }
}

export async function fetchNewsByUuid(
  uuid: string,
  options?: { noStore?: boolean }
): Promise<News | null> {
  try {
    const article = await fetchJson<News>(`/news/${encodeURIComponent(uuid)}`, options?.noStore
      ? { cache: 'no-store' }
      : { next: { revalidate: 60, tags: ['news', `news:${uuid}`] } });
    return article ? normalizeNews(article) : null;
  } catch {
    const item = seedNews.find((news) => String(news.uuid ?? news.id) === uuid);
    return item ? normalizeNews(item) : null;
  }
}

export function getProductImageSrc(image: string): string {
  if (image.startsWith('/')) return image;
  if (/^https?:\/\//i.test(image)) return image;
  return `/assets/${encodeURIComponent(image)}`;
}
