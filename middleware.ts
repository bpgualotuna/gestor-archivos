import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rutas de admin solo para ADMIN
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Rutas de revisión solo para áreas y admin
    if (path.startsWith('/review')) {
      const allowedRoles = ['COMERCIAL', 'TECNICA', 'FINANCIERA', 'LEGAL', 'ADMIN'];
      if (!token?.role || !allowedRoles.includes(token.role)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Rutas públicas
        if (path.startsWith('/login') || path.startsWith('/api/auth')) {
          return true;
        }

        // Todas las demás rutas requieren autenticación
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
