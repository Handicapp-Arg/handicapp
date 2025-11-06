'use client';
import { appConfig } from '@/lib/config';
import AuthManager from '../auth/AuthManager';

export class ApiClient {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // Obtener token del AuthManager (opcional, las cookies HTTP-only funcionan automáticamente)
      const token = AuthManager.getInstance().getAuthToken();
      
      const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
      const headers: HeadersInit = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        // Solo agregar Authorization header si hay token en memoria (opcional)
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.headers as any),
      };
      const config: RequestInit = {
        credentials: 'include', // ✅ CRÍTICO: Las cookies httpOnly se envían automáticamente
        headers,
        ...options,
      };

      const fullUrl = `${appConfig.apiBaseUrl}${endpoint}`;

      const response = await fetch(fullUrl, config);
      
      // Manejar errores de autenticación
      if (response.status === 401) {
        // Si es un endpoint de login/refresh, no intentar renovar
        if (endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Credenciales inválidas');
        }

        // Token expirado - intentar refresh automático (el interceptor en http.ts lo maneja)
        // Si llegamos aquí desde apiClient directamente, redirigir a login
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
          console.error(`❌ API Error Response:`, errorData);
          console.error(`❌ Request URL:`, fullUrl);
          console.error(`❌ Request Method:`, options.method || 'GET');
          
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (Array.isArray(errorData.errors) && errorData.errors.length) {
            errorDetails = errorData.errors;
            // Si hay detalles, agregamos el primero al mensaje para visibilidad inmediata
            errorMessage = `${errorMessage}${errorDetails ? `: ${errorDetails[0]}` : ''}`;
          }
          
          // Si el errorData está vacío, usar mensaje genérico con más info
          if (Object.keys(errorData).length === 0) {
            errorMessage = `Error ${response.status}: La solicitud falló. URL: ${endpoint}`;
          }
        } catch (e) {
          console.error(`❌ Could not parse error response:`, e);
          // If can't parse error response, use default message with more context
          errorMessage = `Error ${response.status}: ${response.statusText} - ${endpoint}`;
        }
        
        const err = new Error(errorMessage) as Error & { details?: string[] };
        if (errorDetails) err.details = errorDetails;
        console.error(`❌ Throwing error:`, err);
        throw err;
      }

  // Si no hay contenido, devolver objeto vacío
  if (response.status === 204) return {} as any;
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

  static async register(data: { nombre: string; apellido: string; email: string; password: string; telefono?: string }) {
    console.log('🌐 apiClient.register - data recibida:', data);
    console.log('🌐 apiClient.register - data.email:', data.email);
    console.log('🌐 apiClient.register - data.email contiene punto:', data.email.includes('.'));
    
    const jsonString = JSON.stringify(data);
    console.log('🌐 apiClient.register - JSON.stringify:', jsonString);
    console.log('🌐 apiClient.register - JSON parseado de vuelta:', JSON.parse(jsonString));
    
    return this.request('/auth/register', {
      method: 'POST',
      body: jsonString,
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