import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://hatoage.wata777.workers.dev';
const token = () => process.env.RENDER_TOKEN ?? '';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const date = String(form.get('date') ?? '').trim();
  const title = String(form.get('title') ?? '').trim();
  const body = String(form.get('body') ?? '').trim();

  if (!date || !title || !body) {
    return NextResponse.redirect(new URL('/admin?status=入力内容を確認してください', req.url), { status: 303 });
  }

  const response = await fetch(`${API_BASE}/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ date, title, body })
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.redirect(new URL(`/admin?status=${encodeURIComponent(`ニュース追加に失敗: ${message}`)}`, req.url), { status: 303 });
  }

  revalidateTag('news');
  return NextResponse.redirect(new URL('/admin?status=ニュースを追加しました', req.url), { status: 303 });
}
