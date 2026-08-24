import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://hatoage.wata777.workers.dev';
const token = () => process.env.RENDER_TOKEN ?? '';
const headers = () => ({ Authorization: `Bearer ${token()}` });

async function proxy(req: NextRequest, method: 'PATCH' | 'DELETE', slug: string) {
  const body = method === 'PATCH'
    ? JSON.stringify({ slug, ...(await req.json()) })
    : JSON.stringify({ slug });

  const response = await fetch(`${API_BASE}/products`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers() },
    body
  });

  const text = await response.text();
  let data: unknown = undefined;
  try { data = text ? JSON.parse(text) : undefined; } catch { data = { message: text }; }

  if (response.ok) revalidateTag('products');
  return NextResponse.json(data ?? { ok: response.ok }, { status: response.status });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxy(req, 'PATCH', slug);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxy(req, 'DELETE', slug);
}
