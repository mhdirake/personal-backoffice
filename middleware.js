import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('admin_token');
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login';

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/posts', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
