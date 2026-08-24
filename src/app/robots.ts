import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: ['/admin', '/api/admin'] }],
    sitemap: 'https://hatoage.wata777.f5.si/sitemap.xml'
  };
}
