'use client';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export class ApiClient {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
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
  }



  private static getToken(): string | null {
    try {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split('; ');
        const authCookie = cookies.find(row => row.startsWith('auth-token='));
        
        if (authCookie) {
          const token = authCookie.split('=')[1];
          if (token && token !== 'undefined' && token !== 'null') {
            return token;
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Auth endpoints
  static async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // User endpoints
  static async getUsers(page = 1, limit = 10) {
    return this.request(`/users?page=${page}&limit=${limit}`);
  }

  static async searchUsers(query: string, page = 1, limit = 10) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
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
}

export default ApiClient;