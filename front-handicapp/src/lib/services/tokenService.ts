/**
 * TokenService - Manejo seguro de tokens JWT en el frontend
 * Implementa auto-refresh de tokens y almacenamiento seguro
 */

interface TokenData {
  accessToken: string;
  expiresIn: number; // segundos
  issuedAt: number; // timestamp
}

interface UserData {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: {
    id: number;
    nombre: string;
    clave: string;
  };
  verificado: boolean;
  estado_usuario: string;
}

class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'handicapp_access_token';
  private static readonly USER_DATA_KEY = 'handicapp_user_data';
  private static readonly TOKEN_EXPIRY_BUFFER = 60; // 60 segundos de buffer antes de expirar
  
  private static refreshTokenPromise: Promise<TokenData | null> | null = null;

  /**
   * Guardar tokens de manera segura
   */
  static setTokens(accessToken: string, expiresIn: number, userData: UserData): void {
    const tokenData: TokenData = {
      accessToken,
      expiresIn,
      issuedAt: Math.floor(Date.now() / 1000) // timestamp en segundos
    };

    try {
      // Guardar en localStorage (en el futuro considerar sessionStorage o cookies httpOnly)
      localStorage.setItem(this.ACCESS_TOKEN_KEY, JSON.stringify(tokenData));
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error guardando tokens:', error);
    }
  }

  /**
   * Obtener access token válido (con auto-refresh si es necesario)
   */
  static async getValidAccessToken(): Promise<string | null> {
    try {
      const tokenDataStr = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      
      if (!tokenDataStr) {
        return null;
      }

      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = tokenData.issuedAt + tokenData.expiresIn;

      // Si el token está por expirar o ya expiró, intentar refrescarlo
      if (now >= (expiresAt - this.TOKEN_EXPIRY_BUFFER)) {
        console.log('Token expiring soon, attempting refresh...');
        
        const newTokenData = await this.refreshAccessToken();
        
        if (newTokenData) {
          return newTokenData.accessToken;
        } else {
          // Si no se pudo refrescar, limpiar datos
          this.clearTokens();
          return null;
        }
      }

      return tokenData.accessToken;
    } catch (error) {
      console.error('Error obteniendo access token:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Refrescar access token usando refresh token
   */
  private static async refreshAccessToken(): Promise<TokenData | null> {
    // Evitar múltiples requests de refresh simultáneos
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshTokenPromise;
      return result;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  /**
   * Realizar el refresh del token
   */
  private static async performTokenRefresh(): Promise<TokenData | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Incluir cookies (refresh token)
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Token refresh failed:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const newTokenData: TokenData = {
          accessToken: data.data.accessToken,
          expiresIn: data.data.expiresIn,
          issuedAt: Math.floor(Date.now() / 1000)
        };

        // Actualizar token en localStorage
        localStorage.setItem(this.ACCESS_TOKEN_KEY, JSON.stringify(newTokenData));
        
        console.log('Token refreshed successfully');
        return newTokenData;
      }

      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Obtener datos del usuario
   */
  static getUserData(): UserData | null {
    try {
      const userDataStr = localStorage.getItem(this.USER_DATA_KEY);
      
      if (!userDataStr) {
        return null;
      }

      return JSON.parse(userDataStr);
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getValidAccessToken();
    const userData = this.getUserData();
    
    return !!(token && userData);
  }

  /**
   * Limpiar todos los tokens y datos
   */
  static clearTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.USER_DATA_KEY);
    } catch (error) {
      console.error('Error limpiando tokens:', error);
    }
  }

  /**
   * Logout (limpiar tokens locales y llamar endpoint de logout)
   */
  static async logout(): Promise<void> {
    try {
      const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      
      if (token) {
        const tokenData: TokenData = JSON.parse(token);
        
        // Llamar endpoint de logout
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${tokenData.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Siempre limpiar tokens locales
      this.clearTokens();
    }
  }

  /**
   * Obtener headers de autorización para requests
   */
  static async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidAccessToken();
    
    if (!token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Verificar si el token está por expirar
   */
  static isTokenExpiringSoon(): boolean {
    try {
      const tokenDataStr = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      
      if (!tokenDataStr) {
        return true;
      }

      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = tokenData.issuedAt + tokenData.expiresIn;

      return now >= (expiresAt - this.TOKEN_EXPIRY_BUFFER);
    } catch (error) {
      return true;
    }
  }
}

export default TokenService;
export type { TokenData, UserData };