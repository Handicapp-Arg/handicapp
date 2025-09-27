import { cookies } from "next/headers";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role?: number;
}

export class CookieService {
  private static readonly COOKIE_NAMES = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    ROLE: "role",
  } as const;

  private static getCookieOptions(maxAge: number) {
    return {
      httpOnly: false, // Necesario para ProtectedRoute client-side
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: maxAge,
    };
  }

  /**
   * Establece las cookies de autenticación (uso en Server Actions)
   */
  static async setAuthCookies(tokens: AuthTokens): Promise<void> {
    const cookieStore = await cookies();
    
    cookieStore.set(
      this.COOKIE_NAMES.ACCESS_TOKEN, 
      tokens.accessToken, 
      this.getCookieOptions(60 * 60 * 24) // 1 día
    );

    if (tokens.role !== undefined) {
      cookieStore.set(
        this.COOKIE_NAMES.ROLE, 
        String(tokens.role), 
        this.getCookieOptions(60 * 60 * 24) // 1 día
      );
    }

    cookieStore.set(
      this.COOKIE_NAMES.REFRESH_TOKEN, 
      tokens.refreshToken, 
      this.getCookieOptions(60 * 60 * 24 * 7) // 7 días
    );
  }

  /**
   * Limpia todas las cookies de autenticación (uso en Server Actions)
   */
  static async clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(this.COOKIE_NAMES.ACCESS_TOKEN);
    cookieStore.delete(this.COOKIE_NAMES.REFRESH_TOKEN);
    cookieStore.delete(this.COOKIE_NAMES.ROLE);
  }
}
