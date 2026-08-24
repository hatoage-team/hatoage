import type { MetadataRoute } from 'next';
import { fetchNewsList, fetchProducts } from '../lib/api';

const baseUrl = 'https://hatoage.wata777.f5.si';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, news] = await Promise.all([fetchProducts(), fetchNewsList()]);

  return [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/search`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/news`, changeFrequency: 'daily', priority: 0.8 },
    ...products.map((product) => ({
      url: `${baseUrl}/products/${encodeURIComponent(product.slug)}`,
      changeFrequency: 'daily' as const,
      priority: 0.7
    })),
    ...news
      .map((item) => item.uuid ?? item.id)
      .filter((id): id is string | number => id !== undefined)
      .map((id) => ({
        url: `${baseUrl}/news/${encodeURIComponent(String(id))}`,
        changeFrequency: 'weekly' as const,
        priority: 0.6
      }))
  ];
}
