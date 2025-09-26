import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Seguridad básica
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  // CSP simple; ajusta dominios de script/style/img según necesidad
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // quita 'unsafe-inline' si no es necesario
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
  "connect-src 'self' http://localhost:3003",
    "font-src 'self' data:",
    "frame-ancestors 'none'",
  ].join("; ");
  res.headers.set("Content-Security-Policy", csp);

  return res;
}

export const config = {
  matcher: ["/:path*"],
};


