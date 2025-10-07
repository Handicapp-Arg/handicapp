/**
 * AuthService - Servicio unificado de autenticación
 * Maneja tokens, cookies, localStorage y estados de manera consistente
 */

import { appConfig } from '@/lib/config';
import { logger } from '@/lib/utils/logger';

// Tipos
export interface UserData {
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

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
  issuedAt: number;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: UserData;
    accessToken: string;
    expiresIn: number;
  };
}

// Constantes
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'handicapp_access_token',
  USER_DATA: 'handicapp_user_data',
} as const;

const COOKIE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  ROLE: 'role',
} as const;

class AuthService {
  private static readonly TOKEN_EXPIRY_BUFFER = 60; // 60 segundos de buffer
  private static refreshTokenPromise: Promise<AuthTokens | null> | null = null;

  /**
   * Realizar login
   */
  static async login(email: string, password: string): Promise<UserData> {
    const response = await fetch(`${appConfig.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Para recibir refresh token en cookie
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el login');
    }

    const data: LoginResponse = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Credenciales inválidas');
    }

    const { user, accessToken, expiresIn } = data.data;
    
    // Guardar tokens y usuario
    this.setAuthData(accessToken, expiresIn, user);
    
    return user;
  }

  /**
   * Realizar logout
   */
  static async logout(): Promise<void> {
    try {
      // Llamar al endpoint de logout del backend
      await fetch(`${appConfig.apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      logger.warn('Error en logout del backend:', error);
    } finally {
      // Limpiar datos locales siempre
      this.clearAuthData();
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getValidAccessToken();
      return token !== null;
    } catch (error) {
      logger.warn('Error verificando autenticación:', error);
      return false;
    }
  }

  /**
   * Obtener usuario actual
   */
  static getCurrentUser(): UserData | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  /**
   * Obtener token válido (con auto-refresh si es necesario)
   */
  static async getValidAccessToken(): Promise<string | null> {
    try {
      const tokenData = this.getStoredTokenData();
      
      if (!tokenData) {
        return null;
      }

      // Verificar si el token está por expirar
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = tokenData.issuedAt + tokenData.expiresIn;
      const shouldRefresh = (expiresAt - now) <= this.TOKEN_EXPIRY_BUFFER;

      if (shouldRefresh) {
        const refreshedToken = await this.refreshAccessToken();
        return refreshedToken?.accessToken || null;
      }

      return tokenData.accessToken;
    } catch (error) {
      logger.error('Error obteniendo token válido:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Obtener headers de autorización
   */
  static getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Intentar obtener token de localStorage (síncrono)
    const tokenData = this.getStoredTokenData();
    if (tokenData) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }

    return headers;
  }

  /**
   * Refrescar token de acceso
   */
  private static async refreshAccessToken(): Promise<AuthTokens | null> {
    // Evitar múltiples refresh simultáneos
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
   * Realizar refresh del token
   */
  private static async performTokenRefresh(): Promise<AuthTokens | null> {
    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Para enviar refresh token en cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const { accessToken, expiresIn, user } = data.data;
        
        // Actualizar tokens y usuario
        this.setAuthData(accessToken, expiresIn, user);
        
        return {
          accessToken,
          expiresIn,
          issuedAt: Math.floor(Date.now() / 1000),
        };
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      logger.error('Error refreshing token:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Guardar datos de autenticación (localStorage + cookies)
   */
  private static setAuthData(accessToken: string, expiresIn: number, user: UserData): void {
    const tokenData: AuthTokens = {
      accessToken,
      expiresIn,
      issuedAt: Math.floor(Date.now() / 1000),
    };

    try {
      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, JSON.stringify(tokenData));
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      // Establecer cookies para middleware y permisos
      const expires = new Date();
      expires.setTime(expires.getTime() + (expiresIn * 1000));
      
      this.setCookie(COOKIE_KEYS.AUTH_TOKEN, accessToken, expires);
      this.setCookie(COOKIE_KEYS.ROLE, user.rol.id.toString(), expires);
      
    } catch (error) {
      logger.error('Error guardando datos de autenticación:', error);
      throw error;
    }
  }

  /**
   * Limpiar todos los datos de autenticación
   */
  private static clearAuthData(): void {
    try {
      // Limpiar localStorage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);

      // Limpiar cookies
      this.deleteCookie(COOKIE_KEYS.AUTH_TOKEN);
      this.deleteCookie(COOKIE_KEYS.ROLE);
      
    } catch (error) {
      logger.error('Error limpiando datos de autenticación:', error);
    }
  }

  /**
   * Obtener datos de token del localStorage
   */
  private static getStoredTokenData(): AuthTokens | null {
    try {
      const tokenData = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      return tokenData ? JSON.parse(tokenData) : null;
    } catch (error) {
      logger.error('Error obteniendo token data:', error);
      return null;
    }
  }

  /**
   * Establecer cookie
   */
  private static setCookie(name: string, value: string, expires: Date): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }
  }

  /**
   * Eliminar cookie
   */
  private static deleteCookie(name: string): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    }
  }
}

export default AuthService;
