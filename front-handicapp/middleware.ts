import { NextResponse, type NextRequest } from "next/server";

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/_next',
  '/api',
  '/favicon.ico',
  '/manifest.json',
  '/logos',
];

// Rutas protegidas que requieren autenticación
const PROTECTED_ROUTES = [
  '/admin',
  '/veterinario', 
  '/capataz',
  '/empleado',
  '/propietario',
  '/establecimiento',
];

/**
 * Middleware mejorado para evitar bucles de redirección
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Permitir acceso a rutas públicas sin verificación
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Verificar solo rutas protegidas específicas
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Verificar autenticación para rutas protegidas
  const authToken = req.cookies.get('auth-token');
  
  if (!authToken || !authToken.value) {
    // Evitar bucle si ya está en login
    if (pathname === '/login') {
      return NextResponse.next();
    }
    
    // Redirigir a login solo si no está autenticado
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si está autenticado y trata de acceder a login, redirigir al dashboard
  if (pathname === '/login' && authToken?.value) {
    const roleId = req.cookies.get('role')?.value;
    const dashboardUrl = getDashboardUrl(roleId);
    const redirectUrl = new URL(dashboardUrl, req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return NextResponse.next();
}

/**
 * Obtener URL del dashboard según el rol
 */
function getDashboardUrl(roleId?: string): string {
  const roleRoutes: Record<string, string> = {
    '1': '/admin',
    '2': '/establecimiento',
    '3': '/capataz', 
    '4': '/veterinario',
    '5': '/empleado',
    '6': '/propietario',
  };
  
  return roleRoutes[roleId || ''] || '/admin';
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de request excepto las que empiecen con:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


