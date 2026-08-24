import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://hatoage.wata777.workers.dev';
const token = () => process.env.RENDER_TOKEN ?? '';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const slug = String(form.get('slug') ?? '').trim();
  const name = String(form.get('name') ?? '').trim();
  const amount = String(form.get('amount') ?? '').trim();
  const image = String(form.get('image') ?? '').trim();
  const price = Number(form.get('price') ?? NaN);

  if (!slug || !name || !amount || !image || !Number.isFinite(price) || price < 0) {
    return NextResponse.redirect(new URL('/admin?status=入力内容を確認してください', req.url), { status: 303 });
  }

  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ slug, name, amount, price, image })
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.redirect(new URL(`/admin?status=${encodeURIComponent(`商品追加に失敗: ${message}`)}`, req.url), { status: 303 });
  }

  revalidateTag('products');
  return NextResponse.redirect(new URL('/admin?status=商品を追加しました', req.url), { status: 303 });
}
