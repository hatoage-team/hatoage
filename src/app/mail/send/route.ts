import { NextRequest, NextResponse } from 'next/server';
import { sendHtmlMail } from '@/lib/gmail';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://hatoage.wata777.workers.dev';

export const runtime = 'nodejs';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? '';
    if (!emailPattern.test(email) || email.length > 254) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください。' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/mail/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RENDER_TOKEN ?? ''}` },
      body: JSON.stringify({ email }),
      cache: 'no-store'
    });
    const data = await response.json().catch(() => ({})) as { otp?: string; error?: string };
    if (!response.ok || !data.otp) {
      return NextResponse.json({ error: data.error ?? '認証コードの発行に失敗しました。' }, { status: 502 });
    }

    await sendHtmlMail({
      to: email,
      subject: '【はとあげメール】認証コード',
      html: `<div style="font-family:sans-serif"><h2>認証コード</h2><p style="font-size:28px;font-weight:bold">${data.otp}</p><p>5分以内に入力してください。</p></div>`
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Mail OTP send error:', error);
    return NextResponse.json({ error: 'メール送信に失敗しました。' }, { status: 500 });
  }
}
