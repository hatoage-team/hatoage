import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://hatoage.wata777.workers.dev';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; otp?: string };
    const email = body.email?.trim().toLowerCase() ?? '';
    const otp = body.otp?.trim() ?? '';
    if (!email || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'メールアドレスと6桁の認証コードを確認してください。' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/mail/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RENDER_TOKEN ?? ''}` },
      body: JSON.stringify({ email, otp }),
      cache: 'no-store'
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Mail OTP verify error:', error);
    return NextResponse.json({ error: '認証に失敗しました。' }, { status: 500 });
  }
}
