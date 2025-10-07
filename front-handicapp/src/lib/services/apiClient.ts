'use client';
import { appConfig } from '@/lib/config';
import AuthManager from '../auth/AuthManager';
import { logger } from '@/lib/utils/logger';

export class ApiClient {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // Obtener token de AuthManager
      const authManager = AuthManager.getInstance();
      const state = authManager.getState();
      
      // Fallback: si no hay token en estado (p. ej., en el primer render), intentar obtenerlo de la cookie
      let token = state.token;
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const authCookie = cookies.find(c => c.startsWith('auth-token='));
        if (authCookie) {
          token = authCookie.split('=')[1] || null;
        }
      }

      const authHeaders: Record<string, string> = {};
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      const config: RequestInit = {
        credentials: 'include', // Incluir cookies para refresh token
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${appConfig.apiBaseUrl}${endpoint}`, config);
      
      // Manejar errores de autenticación
      if (response.status === 401) {
        // Token expirado o inválido
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.code === 'TOKEN_EXPIRED' || errorData.code === 'INVALID_TOKEN') {
          // Token expirado - limpiar y redirigir al login
          const authManager = AuthManager.getInstance();
          await authManager.logout();
          
          // Lanzar error para que el componente maneje la redirección
          throw new Error('Sesión expirada. Inicia sesión nuevamente.');
        }
        
        throw new Error(errorData.message || 'No autorizado');
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails: string[] | undefined;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (Array.isArray(errorData.errors) && errorData.errors.length) {
            errorDetails = errorData.errors;
            // Si hay detalles, agregamos el primero al mensaje para visibilidad inmediata
            errorMessage = `${errorMessage}${errorDetails ? `: ${errorDetails[0]}` : ''}`;
          }
        } catch (e) {
          // If can't parse error response, use default message
        }
        
        const err = new Error(errorMessage) as Error & { details?: string[] };
        if (errorDetails) err.details = errorDetails;
        throw err;
      }

      return response.json();
    } catch (error) {
      // Si es un error de red o similar, también verificar autenticación
      if (error instanceof TypeError && error.message.includes('fetch')) {
  logger.error('Network error:', error);
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
      
      throw error;
    }
  }

  // Auth endpoints
  static async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignorar errores en logout, siempre limpiar tokens locales
  logger.warn('Error during logout:', error);
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

  // User endpoints
  static async getUsers(page = 1, limit = 10) {
    return this.request(`/users?page=${page}&limit=${limit}`);
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