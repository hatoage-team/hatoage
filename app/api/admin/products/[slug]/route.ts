import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://hatoage.wata777.workers.dev';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json();

  const response = await fetch(`${API_BASE}/products/${slug}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RENDER_TOKEN ?? ''}`
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();

  return NextResponse.json(
    { ok: response.ok, message: text || undefined },
    { status: response.status }
  );
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const response = await fetch(`${API_BASE}/products/${slug}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${process.env.RENDER_TOKEN ?? ''}`
    }
  });

  const text = await response.text();

  return NextResponse.json(
    { ok: response.ok, message: text || undefined },
    { status: response.status }
  );
}
