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
  telefono?: string | null;
  avatar_url?: string | null;
  ubicacion?: string | null;
  establecimiento_id?: number;
  establecimiento_nombre?: string;
  ultimo_acceso_el?: string | null;
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

  /**
   * Actualizar los datos de usuario y persistirlos (localStorage + cookies)
   */
  public updateUser(partial: Partial<UserData>): void {
    const current = this.currentState.user;
    const token = this.currentState.token;
    if (!current || !token) return;
    const merged: UserData = { ...current, ...partial } as UserData;
    this.saveAuthData(token, merged);
    this.updateState({ user: merged });
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

      const storedData = this.getStoredAuthData();

      if (storedData.token && storedData.user) {
        // Trust local data immediately — don't block the app on a network call
        this.updateState({
          isAuthenticated: true,
          user: storedData.user,
          token: storedData.token,
          isLoading: false,
          error: null,
        });
        this.syncCookies(storedData.token, storedData.user);

        // Verify token in background — if invalid, logout silently
        this.verifyTokenBackground(storedData.token);
        return;
      }

      // User data in localStorage but no readable token — try to restore via httpOnly cookie refresh
      if (!storedData.token && storedData.user) {
        try {
          const refreshRes = await fetch(`${appConfig.apiBaseUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json().catch(() => ({}));
            const newToken = data.data?.accessToken ?? data.accessToken ?? data.token;
            if (newToken) {
              this.saveAuthData(newToken, storedData.user);
              this.updateState({
                isAuthenticated: true,
                user: storedData.user,
                token: newToken,
                isLoading: false,
                error: null,
              });
              return;
            }
          }
        } catch {
          // refresh failed — fall through to unauthenticated
        }
      }

      // No valid session — not authenticated
      this.updateState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error initializing auth:', error);
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
   * Verificar token en background sin bloquear la UI.
   * Si el token expiró, intenta refresh antes de hacer logout.
   * Si hay error de red, mantiene la sesión activa.
   */
  private verifyTokenBackground(token: string): void {
    this.verifyToken(token)
      .then(async (isValid) => {
        if (!isValid) {
          // Token expirado — intentar refresh con cookie httpOnly
          try {
            const refreshRes = await fetch(`${appConfig.apiBaseUrl}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
            });
            if (refreshRes.ok) {
              const data = await refreshRes.json().catch(() => ({}));
              const newToken = data.data?.accessToken ?? data.accessToken ?? data.token;
              const currentUser = this.currentState.user;
              if (newToken && currentUser) {
                this.saveAuthData(newToken, currentUser);
                this.updateState({ token: newToken });
              }
              return; // sesión renovada
            }
          } catch {
            // refresh falló — caída de red
          }
          // Refresh falló → logout real
          this.clearAuthData();
          this.updateState({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: null,
          });
        }
      })
      .catch(() => {
        // Network error — keep session alive, API interceptors handle 401s
      });
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
      
      if (!accessToken) {
        throw new Error('No se recibió accessToken del servidor');
      }
      
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

      // Intentar logout en backend — siempre, incluso sin token local (usa cookie httpOnly)
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.currentState.token) {
          headers['Authorization'] = `Bearer ${this.currentState.token}`;
        }
        await fetch(`${appConfig.apiBaseUrl}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers,
        });
      } catch {
        // ignorar — limpiar local de todas formas
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
   * Refrescar datos del usuario desde el backend
   */
  async refreshUser(): Promise<void> {
    try {
      const token = this.currentState.token;
      
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.REQUEST);

      const response = await fetch(`${appConfig.apiBaseUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Error al obtener perfil');
      }

      const data = await response.json();
      
      if (data?.data) {
        const user = data.data;
        this.saveAuthData(token, user);
        this.updateState({ user });
      }

    } catch (error) {
      console.warn('Error al refrescar usuario:', error);
      throw error;
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

      // Only invalidate on explicit auth failure — not on network/server errors
      if (response.status === 401 || response.status === 403) {
        return false;
      }
      return true;

    } catch (error) {
      // Network error or timeout — assume token is still valid
      // API interceptors will catch 401s on actual requests
      console.warn('Token background verification skipped (network error):', error);
      return true;
    }
  }

  /**
   * Establecer tokens de autenticación (para verificación de email)
   */
  async setAuthTokens({ accessToken, refreshToken, user }: { accessToken: string; refreshToken: string; user: UserData }): Promise<void> {
    try {
      // Guardar tokens en cookies httpOnly (el backend lo hace automáticamente, pero también guardamos localmente)
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
      console.error('Error estableciendo tokens:', error);
      throw error;
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

      // Guardar datos del usuario en localStorage (no el token)
      localStorage.setItem(STORAGE_CONFIG.USER_DATA, JSON.stringify(user));

      // El token solo se guarda en cookies (no en localStorage por seguridad)
      this.syncCookies(token, user);

    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Error guardando datos de autenticación');
    }
  }

  /**
   * Sincronizar cookies para middleware
   * Solo sincroniza el rol — auth-token es manejado como httpOnly por el backend
   */
  private syncCookies(_token: string, user: UserData): void {
    try {
      if (typeof document !== 'undefined') {
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
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

      // El token se lee exclusivamente desde cookie (no localStorage)
      let token: string | null = null;
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const authCookie = cookies.find(c => c.startsWith(`${STORAGE_CONFIG.COOKIE_AUTH}=`));
        if (authCookie) {
          token = authCookie.split('=')[1] || null;
        }
      }

      const userData = localStorage.getItem(STORAGE_CONFIG.USER_DATA);

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
      
      // Limpiar localStorage (solo datos de usuario, el token nunca se guardó aquí)
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