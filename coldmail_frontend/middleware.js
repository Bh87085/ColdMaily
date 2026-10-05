import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('app_refresh_token');
  const pathname = request.nextUrl.pathname;

  // Redirect from landing page '/' to '/home' if token exists
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Protected routes
  const protectedPaths = ['/home', '/profile', '/settings', '/mails'];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    // Redirect to unauthorized page or login if no token
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Otherwise, proceed normally
  return NextResponse.next();
}

// Specify which paths to run middleware on, including landing '/'
export const config = {
  matcher: ['/', '/home/:path*', '/profile/:path*', '/settings/:path*', '/mails/:path*'],
};
