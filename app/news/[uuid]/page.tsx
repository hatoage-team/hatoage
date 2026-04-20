import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchNewsByUuid } from '../../../lib/api';

export const dynamic = 'force-dynamic';

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
          <p className="news-uuid">記事ID: {article.uuid || article.id}</p>
        </header>
        <p className="news-body">{article.body || '本文は準備中です。'}</p>
      </article>
    </main>
  );
}
