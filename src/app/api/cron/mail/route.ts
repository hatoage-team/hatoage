import { NextRequest, NextResponse } from 'next/server';
import { sendHtmlMail } from '../../../../lib/gmail';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://hatoage.wata777.workers.dev';

export const runtime = 'nodejs';

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [productsResponse, subscribersResponse] = await Promise.all([
      fetch(`${API_BASE}/products`, { cache: 'no-store' }),
      fetch(`${API_BASE}/mail`, { headers: { Authorization: `Bearer ${process.env.RENDER_TOKEN ?? ''}` }, cache: 'no-store' })
    ]);
    if (!productsResponse.ok || !subscribersResponse.ok) throw new Error('Failed to fetch mail data');

    const products = await productsResponse.json() as Array<{ name: string; amount: string; price: number | string; image: string; slug: string }>;
    const subscribers = await subscribersResponse.json() as Array<{ email: string }>;
    const picks = [...products].sort(() => Math.random() - 0.5).slice(0, 3);
    const html = `<div style="font-family:sans-serif"><img src="https://hatoage.wata777.f5.si/assets/logo.png" width="300"><h2>今日のはとあげ</h2>${picks.map((p) => `<div style="border:1px solid #ddd;padding:10px;margin:10px 0"><h3>${p.name}</h3><img src="https://hatoage.wata777.f5.si/assets/${encodeURIComponent(p.image)}" width="200"><p>${p.amount}</p><strong>¥${p.price}</strong><br><a href="https://hatoage.wata777.f5.si/order/${encodeURIComponent(p.slug)}">購入する</a></div>`).join('')}</div>`;

    for (const subscriber of subscribers) await sendHtmlMail({ to: subscriber.email, subject: '今日のはとあげ', html });
    return NextResponse.json({ ok: true, sent: subscribers.length });
  } catch (error) {
    console.error('Mail cron error:', error);
    return NextResponse.json({ error: 'メール配信に失敗しました。' }, { status: 500 });
  }
}
