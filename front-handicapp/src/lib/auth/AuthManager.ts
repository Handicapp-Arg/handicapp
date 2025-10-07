/**
 * AuthManager - Gestor central de autenticación con mejores prácticas
 * - Evita bucles de redirección
 * - Maneja estados de carga de manera robusta
 * - Sincroniza localStorage, cookies y estado de React
 * - Implementa retry logic y timeout handling
 */

import { appConfig } from '@/lib/config';

// Tipos principales
export interface UserData {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  establecimiento_id?: number;
  rol: {
    id: number;
    nombre: string;
    clave: string;
  };
  verificado: boolean;
  estado_usuario: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Configuración de storage
const STORAGE_CONFIG = {
  ACCESS_TOKEN: 'happ_access_token',
  USER_DATA: 'happ_user_data',
  AUTH_STATE: 'happ_auth_state',
  COOKIE_AUTH: 'auth-token',
  COOKIE_ROLE: 'role',
} as const;

// Configuración de timeouts
const TIMEOUTS = {
  REQUEST: 10000, // 10 segundos
  TOKEN_BUFFER: 60, // 60 segundos antes de expiración
} as const;

class AuthManager {
  private static instance: AuthManager;
  private listeners: Set<(state: AuthState) => void> = new Set();
  private currentState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
  };
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * Suscribirse a cambios de estado
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    // Enviar estado actual inmediatamente
    listener(this.currentState);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Obtener estado actual
   */
  getState(): AuthState {
    return { ...this.currentState };
  }

  /**
   * Inicializar autenticación
   */
  private async initializeAuth(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      this.updateState({ isLoading: true, error: null });

      // Verificar si hay datos de autenticación válidos
      const storedData = this.getStoredAuthData();
      
      if (storedData.token && storedData.user) {
        // Verificar si el token es válido
        const isValid = await this.verifyToken(storedData.token);
        
        if (isValid) {
          this.updateState({
            isAuthenticated: true,
            user: storedData.user,
            token: storedData.token,
            isLoading: false,
            error: null,
          });
          
          // Actualizar cookies
          this.syncCookies(storedData.token, storedData.user);
          return;
        }
      }

      // No hay datos válidos
      this.clearAuthData();
      this.updateState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
      
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.clearAuthData();
      this.updateState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: 'Error de inicialización',
      });
    }
  }

  /**
   * Login con timeout y retry
   */
  async login(email: string, password: string): Promise<void> {
    try {
      this.updateState({ isLoading: true, error: null });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.REQUEST);

      const response = await fetch(`${appConfig.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el login');
      }

      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error('Respuesta de login inválida');
      }

      const { user, accessToken } = data.data;
      
      // Guardar datos
      this.saveAuthData(accessToken, user);
      
      // Actualizar estado
      this.updateState({
        isAuthenticated: true,
        user,
        token: accessToken,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de login';
      this.updateState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * Logout con limpieza completa
   */
  async logout(): Promise<void> {
    try {
      this.updateState({ isLoading: true });

      // Intentar logout en backend
      if (this.currentState.token) {
        try {
          await fetch(`${appConfig.apiBaseUrl}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${this.currentState.token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.warn('Error en logout backend:', error);
        }
      }

    } finally {
      // Limpiar datos locales siempre
      this.clearAuthData();
      this.updateState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    }
  }

  /**
   * Verificar token con el backend
   */
  private async verifyToken(token: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.REQUEST);

      const response = await fetch(`${appConfig.apiBaseUrl}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
      
    } catch (error) {
      console.warn('Token verification failed:', error);
      return false;
    }
  }

  /**
   * Guardar datos de autenticación
   */
  private saveAuthData(token: string, user: UserData): void {
    try {
      // Verificar si estamos en el cliente (navegador)
      if (typeof window === 'undefined') {
        return;
      }
      
      // Guardar en localStorage
      localStorage.setItem(STORAGE_CONFIG.ACCESS_TOKEN, token);
      localStorage.setItem(STORAGE_CONFIG.USER_DATA, JSON.stringify(user));
      
      // Sincronizar cookies
      this.syncCookies(token, user);
      
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Error guardando datos de autenticación');
    }
  }

  /**
   * Sincronizar cookies para middleware
   */
  private syncCookies(token: string, user: UserData): void {
    try {
      if (typeof document !== 'undefined') {
        // Cookie de 1 hora para auth
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        
        document.cookie = `${STORAGE_CONFIG.COOKIE_AUTH}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        document.cookie = `${STORAGE_CONFIG.COOKIE_ROLE}=${user.rol.id}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      }
    } catch (error) {
      console.warn('Error setting cookies:', error);
    }
  }

  /**
   * Obtener datos almacenados
   */
  private getStoredAuthData(): { token: string | null; user: UserData | null } {
    try {
      // Verificar si estamos en el cliente (navegador)
      if (typeof window === 'undefined') {
        return { token: null, user: null };
      }
      
      let token = localStorage.getItem(STORAGE_CONFIG.ACCESS_TOKEN);
      const userData = localStorage.getItem(STORAGE_CONFIG.USER_DATA);
      // Fallback: si no hay token en storage, intentar leer cookie
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const authCookie = cookies.find(c => c.startsWith(`${STORAGE_CONFIG.COOKIE_AUTH}=`));
        if (authCookie) {
          token = authCookie.split('=')[1] || null;
        }
      }
      
      return {
        token,
        user: userData ? JSON.parse(userData) : null,
      };
    } catch (error) {
      console.error('Error getting stored auth data:', error);
      return { token: null, user: null };
    }
  }

  /**
   * Limpiar todos los datos de autenticación
   */
  private clearAuthData(): void {
    try {
      // Verificar si estamos en el cliente (navegador)
      if (typeof window === 'undefined') {
        return;
      }
      
      // Limpiar localStorage
      localStorage.removeItem(STORAGE_CONFIG.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_CONFIG.USER_DATA);
      localStorage.removeItem(STORAGE_CONFIG.AUTH_STATE);
      
      // Limpiar cookies
      if (typeof document !== 'undefined') {
        document.cookie = `${STORAGE_CONFIG.COOKIE_AUTH}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
        document.cookie = `${STORAGE_CONFIG.COOKIE_ROLE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
      }
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Actualizar estado y notificar listeners
   */
  private updateState(updates: Partial<AuthState>): void {
    this.currentState = { ...this.currentState, ...updates };
    
    // Notificar a todos los listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }

  /**
   * Obtener token para requests
   */
  getAuthToken(): string | null {
    return this.currentState.token;
  }

  /**
   * Obtener headers de autorización
   */
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.currentState.token) {
      headers['Authorization'] = `Bearer ${this.currentState.token}`;
    }

    return headers;
  }
}

export default AuthManager;