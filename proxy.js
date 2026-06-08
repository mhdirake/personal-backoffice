import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('admin_token');
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login';
  const isAdminArea = pathname.startsWith('/admin');

  // Redirect root to admin
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(token ? '/admin/posts' : '/admin/login', request.url)
    );
  }

  // Protect admin routes
  if (isAdminArea && !isLoginPage && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Redirect away from login if already authenticated
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin/posts', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin', '/admin/:path*'],
};
