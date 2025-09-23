import { cookies } from "next/headers";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class CookieService {
  private static readonly COOKIE_NAMES = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
  } as const;

  private static readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 días
  } as const;

  /**
   * Establece las cookies de autenticación
   */
  static setAuthCookies(tokens: AuthTokens): void {
    const cookieStore = cookies();
    
    cookieStore.set(this.COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
      ...this.COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24, // 1 día
    });

    cookieStore.set(this.COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
      ...this.COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });
  }

  /**
   * Obtiene el token de acceso
   */
  static getAccessToken(): string | null {
    const cookieStore = cookies();
    return cookieStore.get(this.COOKIE_NAMES.ACCESS_TOKEN)?.value || null;
  }

  /**
   * Obtiene el token de refresh
   */
  static getRefreshToken(): string | null {
    const cookieStore = cookies();
    return cookieStore.get(this.COOKIE_NAMES.REFRESH_TOKEN)?.value || null;
  }

  /**
   * Limpia todas las cookies de autenticación
   */
  static clearAuthCookies(): void {
    const cookieStore = cookies();
    
    cookieStore.delete(this.COOKIE_NAMES.ACCESS_TOKEN);
    cookieStore.delete(this.COOKIE_NAMES.REFRESH_TOKEN);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }
}
