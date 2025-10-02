import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Solo aplicar middleware a rutas del dashboard
  const dashboardRoutes = ['/admin', '/veterinario', '/capataz', '/empleado', '/propietario', '/establecimiento'];
  const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route));

  if (isDashboardRoute) {
    const token = req.cookies.get('auth-token');
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/veterinario/:path*',
    '/capataz/:path*',
    '/empleado/:path*',
    '/propietario/:path*',
    '/establecimiento/:path*'
  ],
};


