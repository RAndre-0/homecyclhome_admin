import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Routes publiques qui n'ont pas besoin d'authentification
const PUBLIC_FILE = /\.(.*)$/; // Pour gérer les fichiers statiques (images, CSS, JS)
const PUBLIC_ROUTES = ['/login']; // Pages accessibles sans authentification

// Rôle requis pour accéder à l'application
const VALID_ROLES = ['ROLE_ADMIN', 'ROLE_SUPERADMIN'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const isPublicRoute =
    PUBLIC_ROUTES.includes(request.nextUrl.pathname) || PUBLIC_FILE.test(request.nextUrl.pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Décoder le token
    const decodedToken = jwt.decode(token);

    // Vérifiez si le token est un objet et contient les rôles
    if (
      typeof decodedToken === 'object' &&
      decodedToken !== null &&
      'roles' in decodedToken &&
      Array.isArray((decodedToken as JwtPayload).roles) &&
      !(decodedToken as JwtPayload).roles.some((role: string) => VALID_ROLES.includes(role))
    ) {
      const unauthorizedUrl = new URL('/login', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|login|_next/static|_next/image|favicon.ico).*)'],
};
