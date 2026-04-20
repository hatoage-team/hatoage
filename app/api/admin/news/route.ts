import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://hatoage.wata777.workers.dev';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const payload = {
    date: String(form.get('date') ?? ''),
    title: String(form.get('title') ?? ''),
    body: String(form.get('body') ?? '')
  };

  const response = await fetch(`${API_BASE}/news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RENDER_TOKEN ?? ''}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.redirect(
      new URL(`/admin?status=${encodeURIComponent(`ニュース追加に失敗: ${message}`)}`, req.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(new URL('/admin?status=ニュースを追加しました', req.url), { status: 303 });
}
