import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchNewsByUuid, fetchNewsList } from '../../../lib/api';

export const revalidate = 60;

export async function generateStaticParams() {
  const news = await fetchNewsList();
  return news
    .map((item) => item.uuid ?? item.id)
    .filter((id): id is string | number => id !== undefined)
    .map((id) => ({ uuid: String(id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ uuid: string }> }): Promise<Metadata> {
  const { uuid } = await params;
  const article = await fetchNewsByUuid(uuid);
  if (!article) return { title: '記事が見つかりません' };
  return { title: article.title, description: article.body };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const article = await fetchNewsByUuid(uuid);

  if (!article) notFound();

  return (
    <main className="news-main">
      <Link href="/news" className="news-back">← ニュース一覧へ戻る</Link>
      <article className="news-post news-post-detail">
        <header className="news-post-header">
          <time dateTime={article.date} className="news-date">{article.date}</time>
          <h1>{article.title}</h1>
          <p className="news-uuid">記事ID: {article.uuid ?? article.id}</p>
        </header>
        <p className="news-body">{article.body}</p>
      </article>
    </main>
  );
}
