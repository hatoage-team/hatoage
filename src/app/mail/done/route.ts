import { NextRequest, NextResponse } from 'next/server';
import { sendHtmlMail } from '../../../lib/gmail';

function authorized(req: NextRequest) {
  const token = process.env.RENDER_TOKEN;
  return Boolean(token) && req.headers.get('authorization') === `Bearer ${token}`;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { email, status } = await req.json() as { email?: string; status?: string };
    if (!email || !['done', 'dup', 'error'].includes(status ?? '')) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const messages = {
      done: ['【はとあげメール】登録完了のお知らせ', '<p>はとあげメールへのご登録ありがとうございます！</p><p><strong>登録が完了しました。</strong></p><p>明日から毎日10時に「今日のはとあげ」をお届けします。お楽しみに！</p>'],
      dup: ['【はとあげメール】登録状況のご案内', '<p>このメールアドレスは<strong>既に登録されています。</strong></p><p>引き続き「はとあげメール」をお楽しみください。</p>'],
      error: ['【はとあげメール】登録エラーのお知らせ', '<p>申し訳ございません。登録処理中にエラーが発生しました。</p><p>もう一度最初からお試しください。</p>']
    } as const;

    const [subject, message] = messages[status as keyof typeof messages];
    await sendHtmlMail({
      to: email,
      subject,
      html: `<div style="font-family:sans-serif;line-height:1.6"><h2>はとあげマーケット</h2>${message}<hr><p style="font-size:12px;color:#888">※このメールに心当たりがない場合は破棄してください。</p></div>`
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Mail done error:', error);
    return NextResponse.json({ error: 'メール送信に失敗しました。' }, { status: 500 });
  }
}
