import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Middleware simplificado - solo para autenticación básica
  const { pathname } = req.nextUrl;
  
  const dashboardRoutes = ['/admin', '/veterinario', '/capataz', '/empleado', '/propietario', '/establecimiento'];
  const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route));

  if (isDashboardRoute) {
    const token = req.cookies.get('access_token');
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


