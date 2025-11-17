import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect admin routes
  if (path.startsWith('/admin') && path !== '/admin') {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    try {
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
