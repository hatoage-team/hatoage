import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://hatoage.wata777.workers.dev';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const payload = {
    slug: String(form.get('slug') ?? ''),
    name: String(form.get('name') ?? ''),
    amount: String(form.get('amount') ?? ''),
    price: Number(form.get('price') ?? 0),
    image: String(form.get('image') ?? '')
  };

  const response = await fetch(`${API_BASE}/products`, {
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
      new URL(`/admin?status=${encodeURIComponent(`商品追加に失敗: ${message}`)}`, req.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(new URL('/admin?status=商品を追加しました', req.url), { status: 303 });
}
