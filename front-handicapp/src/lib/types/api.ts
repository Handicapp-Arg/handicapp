export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface LoginResponse {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

export interface ApiError {
  data?: {
    message?: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
  message?: string;
  status?: number;
}

export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  status?: number;
}
