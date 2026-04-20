import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function unauthorizedResponse() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"'
    }
  });
}

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !pass) {
    return NextResponse.next();
  }

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Basic ')) {
    return unauthorizedResponse();
  }

  const encoded = auth.split(' ')[1] ?? '';
  const decoded = atob(encoded);
  const [inputUser, inputPass] = decoded.split(':');

  if (inputUser !== user || inputPass !== pass) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
