import { NextRequest, NextResponse } from 'next/server';

function unauthorizedResponse() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin Area", charset="UTF-8"' }
  });
}

function serverError(message: string) {
  return new NextResponse(message, { status: 500 });
}

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!user || !pass) {
    return isProduction
      ? serverError('Admin authentication is not configured.')
      : NextResponse.next();
  }

  const method = req.method.toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const origin = req.headers.get('origin');
    if (origin && origin !== req.nextUrl.origin) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Basic ')) return unauthorizedResponse();

  try {
    const decoded = atob(auth.slice(6));
    const separator = decoded.indexOf(':');
    if (separator < 0) return unauthorizedResponse();

    const inputUser = decoded.slice(0, separator);
    const inputPass = decoded.slice(separator + 1);
    if (inputUser !== user || inputPass !== pass) return unauthorizedResponse();
  } catch {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
