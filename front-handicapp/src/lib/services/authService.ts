import { httpJson, HttpError } from "../http";

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      nombre: string;
      apellido: string;
      rol_id: number;
      verificado: boolean;
      estado_usuario: string;
      creado_el: string;
    };
    token: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      nombre: string;
      apellido: string;
      rol_id: number;
    };
    token: string;
  };
}

export class AuthService {
  private static readonly ENDPOINTS = {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
  } as const;

  /**
   * Registra un nuevo usuario
   */
  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await httpJson<RegisterResponse, RegisterRequest>(
        this.ENDPOINTS.REGISTER,
        {
          method: "POST",
          body: data,
        }
      );

      return response;
    } catch (error) {
      if (error instanceof HttpError) {
        // El backend ya maneja los errores, solo los propagamos
        throw error;
      }
      throw new HttpError("Error de conexión", 0, null);
    }
  }

  /**
   * Inicia sesión de usuario
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpJson<LoginResponse, LoginRequest>(
        this.ENDPOINTS.LOGIN,
        {
          method: "POST",
          body: data,
        }
      );

      return response;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError("Error de conexión", 0, null);
    }
  }

  /**
   * Cierra sesión del usuario
   */
  static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await httpJson<{ success: boolean; message: string }>(
        this.ENDPOINTS.LOGOUT,
        {
          method: "POST",
        }
      );

      return response;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError("Error de conexión", 0, null);
    }
  }
}
