import { apiClient } from '@/lib/http';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  activo: boolean;
  establecimiento_id?: number;
  rol?: {
    id: number;
    nombre: string;
    clave: string;
  };
}

export interface CreateUserData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol_id: number;
  establecimiento_id?: number;
}

class UserService {
  private baseUrl = '/users';

  async getAll(filters: any = {}): Promise<{ data: User[], total: number, page: number, limit: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params}`) as any;
    return response.data;
  }

  async getById(id: number): Promise<User> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`) as any;
    return response.data;
  }

  async create(data: CreateUserData): Promise<User> {
    const response = await apiClient.post(this.baseUrl, data) as any;
    return response.data;
  }

  async update(id: number, data: Partial<CreateUserData>): Promise<User> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data) as any;
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`) as any;
    return response.data;
  }
}

// Export the service instance
export const userService = new UserService();