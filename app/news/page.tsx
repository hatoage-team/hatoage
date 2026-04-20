import Link from 'next/link';
import { fetchNewsList } from '../../lib/api';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const news = await fetchNewsList();

  return (
    <main className="news-main">
      <section className="news-hero">
        <p className="news-tag">HATOAGE BLOG</p>
        <h1>ニュース</h1>
        <p className="news-subtitle">はとあげマートの最新情報・お知らせをお届けします。</p>
      </section>

      {news.length === 0 && <p className="news-empty">現在、お知らせはありません。</p>}

      <section className="news-list">
        {news.map((item) => {
          const key = item.uuid || item.id || `${item.date}-${item.title}`;
          const id = item.uuid || item.id || key;
          return (
            <article key={key} className="news-post">
              <Link className="news-link" href={`/news/${id}`}>
                <header className="news-post-header">
                  <time dateTime={item.date} className="news-date">{item.date}</time>
                  <h2>{item.title}</h2>
                </header>
                <p className="news-body">{item.body || '本文は準備中です。'}</p>
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
