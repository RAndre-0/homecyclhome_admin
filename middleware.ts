import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Définir les routes publiques qui n'ont pas besoin d'authentification
const PUBLIC_FILE = /\.(.*)$/; // Pour gérer les fichiers statiques (images, CSS, JS)
const PUBLIC_ROUTES = ['/login']; // Ajoutez ici les pages accessibles sans authentification

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const isPublicRoute =
    PUBLIC_ROUTES.includes(request.nextUrl.pathname) || PUBLIC_FILE.test(request.nextUrl.pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    console.log('Redirecting to:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|login|_next/static|_next/image|favicon.ico).*)'],
};
