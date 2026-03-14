/**
 * ApiClient — Cliente HTTP centralizado para HandicApp.
 * Maneja autenticación JWT (Bearer token desde cookie via AuthManager),
 * refresh automático de tokens en 401, timeout de 15s, y FormData multipart.
 * Todos los servicios en lib/services/ deben usar este cliente en lugar de fetch directo.
 */

'use client';
import { appConfig } from '@/lib/config';
import AuthManager from '../auth/AuthManager';

export class ApiClient {
  private static readonly TIMEOUT_MS = 15_000;
  private static isRefreshing = false;
  private static refreshPromise: Promise<void> | null = null;

  private static async doRefresh(): Promise<void> {
    const response = await fetch(`${appConfig.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Refresh failed');
    const data = await response.json().catch(() => ({}));
    const newToken = data.accessToken ?? data.token ?? data.data?.accessToken;
    const auth = AuthManager.getInstance();
    const currentUser = auth.getState().user;
    if (newToken && currentUser) {
      await auth.setAuthTokens({ accessToken: newToken, refreshToken: '', user: currentUser });
    }
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ApiClient.TIMEOUT_MS);

    try {
      const token = AuthManager.getInstance().getAuthToken();

      const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
      const headers: HeadersInit = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.headers as any),
      };
      const config: RequestInit = {
        credentials: 'include',
        headers,
        signal: controller.signal,
        ...options,
      };

      const fullUrl = `${appConfig.apiBaseUrl}${endpoint}`;

      const response = await fetch(fullUrl, config);

      // Manejar errores de autenticación
      if (response.status === 401) {
        // Endpoints de auth nunca se reintentan
        if (endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Credenciales inválidas');
        }

        // Solo intentar refresh una vez — evitar loop infinito
        if (!isRetry) {
          try {
            // Si ya hay un refresh en curso, esperar al mismo
            if (!ApiClient.isRefreshing) {
              ApiClient.isRefreshing = true;
              ApiClient.refreshPromise = ApiClient.doRefresh().finally(() => {
                ApiClient.isRefreshing = false;
                ApiClient.refreshPromise = null;
              });
            }
            await ApiClient.refreshPromise;
            // Reintentar request original con nuevo token
            return ApiClient.request<T>(endpoint, options, true);
          } catch {
            // Refresh falló — sesión realmente expirada
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw new Error('Sesión expirada. Por favor, volvé a ingresar.');
          }
        }

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Sesión expirada');
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails: string[] | undefined;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            errorDetails = errorData.errors as string[];
            errorMessage = `${errorMessage}: ${errorDetails[0] ?? ''}`;
          }
          if (Object.keys(errorData).length === 0) {
            errorMessage = `Error ${response.status}: La solicitud falló`;
          }
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }

        const err = new Error(errorMessage) as Error & { details?: string[] };
        if (errorDetails) err.details = errorDetails;
        throw err;
      }

      if (response.status === 204) return {} as any;
      return response.json();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado. Verificá tu conexión.');
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Verificá tu conexión a internet.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Auth endpoints
  static async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(data: { nombre: string; apellido: string; email: string; password: string; telefono?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignorar errores en logout, siempre limpiar tokens locales
    } finally {
      await AuthManager.getInstance().logout();
    }
  }

  static async verifyToken() {
    return this.request('/auth/verify', {
      method: 'GET',
    });
  }

  static async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  static async sendPasswordReset(email: string) {
    return this.request('/auth/send-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async performPasswordReset(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  static async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  static async resendVerification(email: string) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // User endpoints
  static async getUsers(page = 1, limit = 10, filters?: { roleId?: number; estado?: string }) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.roleId) {
      params.append('roleId', filters.roleId.toString());
    }
    if (filters?.estado) {
      params.append('estado', filters.estado);
    }
    
    return this.request(`/users?${params.toString()}`);
  }

  static async searchUsers(query: string, page = 1, limit = 10) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  static async getUserById(userId: number) {
    return this.request(`/users/${userId}`);
  }

  static async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async updateUser(userId: number, userData: any) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  static async deleteUser(userId: number) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  static async toggleUserStatus(userId: number) {
    return this.request(`/users/${userId}/toggle-status`, {
      method: 'PATCH',
    });
  }

  static async changePassword(userId: number, passwordData: any) {
    return this.request(`/users/${userId}/change-password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Role endpoints
  static async getRoles() {
    return this.request('/roles');
  }

  // Stats endpoints
  static async getUserStats() {
    return this.request('/users/stats');
  }

  // Establecimiento endpoints
  static async getEstablecimientos(page = 1, limit = 10, filters: any = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    return this.request(`/establecimientos?${params}`);
  }

  static async getEstablecimientoById(id: number) {
    return this.request(`/establecimientos/${id}`);
  }

  static async createEstablecimiento(data: any) {
    return this.request('/establecimientos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateEstablecimiento(id: number, data: any) {
    return this.request(`/establecimientos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteEstablecimiento(id: number) {
    return this.request(`/establecimientos/${id}`, {
      method: 'DELETE',
    });
  }

  // Caballo endpoints
  static async getCaballos(page = 1, limit = 10, filters: any = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    return this.request(`/caballos?${params}`);
  }

  static async getCaballoById(id: number) {
    return this.request(`/caballos/${id}`);
  }

  static async createCaballo(data: any) {
    return this.request('/caballos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateCaballo(id: number, data: any) {
    return this.request(`/caballos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteCaballo(id: number) {
    return this.request(`/caballos/${id}`, {
      method: 'DELETE',
    });
  }

  // Utilidades
  static async healthCheck() {
    return this.request('/auth/health', {
      method: 'GET',
    });
  }

  // Método público para que los servicios puedan hacer peticiones HTTP
  static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, options);
  }
}

export default ApiClient;