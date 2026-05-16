import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  
  // Supprimer le cookie côté serveur
  response.cookies.set('session', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}