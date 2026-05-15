import { NextResponse } from 'next/server';

export function middleware(request) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Pages protégées
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  // Si page protégée et pas de session → redirection login
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si déjà connecté et essaie d'aller sur /login → redirection dashboard
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
};