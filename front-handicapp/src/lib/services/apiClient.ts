'use client';
import { appConfig } from '@/lib/config';
import TokenService from './tokenService';

export class ApiClient {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // Obtener headers de autenticación
      const authHeaders = await TokenService.getAuthHeaders();
      
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
          // Intentar refrescar token automáticamente
          const newToken = await TokenService.getValidAccessToken();
          
          if (newToken) {
            // Reintentar request con nuevo token
            const retryConfig: RequestInit = {
              ...config,
              headers: {
                ...config.headers,
                'Authorization': `Bearer ${newToken}`
              }
            };
            
            const retryResponse = await fetch(`${appConfig.apiBaseUrl}${endpoint}`, retryConfig);
            
            if (retryResponse.ok) {
              return retryResponse.json();
            }
          }
          
          // Si no se pudo refrescar, limpiar tokens y redirigir a login
          TokenService.clearTokens();
          
          // En el cliente, podemos usar window.location
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        
        throw new Error(errorData.message || 'No autorizado');
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If can't parse error response, use default message
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      // Si es un error de red o similar, también verificar autenticación
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error:', error);
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
      console.warn('Error during logout:', error);
    } finally {
      TokenService.clearTokens();
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
      method: 'POST',
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
}

export default ApiClient;