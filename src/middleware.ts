import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/auth/login', '/auth/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/icons') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Read the role cookie (set client-side after login)
  const role = request.cookies.get('user_role')?.value;
  const uid = request.cookies.get('user_uid')?.value;

  // If not authenticated, redirect to login
  if (!uid) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based path protection
  if (pathname.startsWith('/teacher') && role !== 'teacher') {
    return NextResponse.redirect(new URL('/student', request.url));
  }

  if (pathname.startsWith('/student') && role !== 'student') {
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  // Root path — redirect based on role
  if (pathname === '/') {
    if (role === 'teacher') return NextResponse.redirect(new URL('/teacher', request.url));
    if (role === 'student') return NextResponse.redirect(new URL('/student', request.url));
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
};
