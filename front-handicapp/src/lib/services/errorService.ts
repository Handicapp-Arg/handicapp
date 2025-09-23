import { HttpError } from "../http";

export interface ErrorResult {
  message: string;
  fieldErrors?: Record<string, string>;
  status: number;
}

export class ErrorService {
  /**
   * Maneja errores HTTP y los convierte en mensajes amigables
   */
  static handleHttpError(error: unknown): ErrorResult {
    if (error instanceof HttpError) {
      return this.handleHttpErrorResponse(error);
    }

    return {
      message: "Error de conexión. Verifica tu internet e intenta nuevamente.",
      status: 0,
    };
  }

  /**
   * Maneja respuestas de error HTTP específicas
   */
  private static handleHttpErrorResponse(error: HttpError): ErrorResult {
    const { status, data } = error;

    switch (status) {
      case 409:
        return {
          message: "Este correo electrónico ya está registrado. Intenta con otro o inicia sesión.",
          fieldErrors: { email: "Este correo ya está en uso" },
          status: 409,
        };

      case 422:
        return {
          message: "Los datos proporcionados no son válidos",
          fieldErrors: this.extractFieldErrors(data),
          status: 422,
        };

      case 429:
        return {
          message: "Demasiados intentos. Espera unos minutos antes de intentar nuevamente.",
          status: 429,
        };

      case 401:
        return {
          message: "Credenciales incorrectas. Verifica tu email y contraseña.",
          status: 401,
        };

      case 403:
        return {
          message: "No tienes permisos para realizar esta acción.",
          status: 403,
        };

      case 404:
        return {
          message: "El recurso solicitado no fue encontrado.",
          status: 404,
        };

      default:
        if (status >= 500) {
          return {
            message: "Error del servidor. Por favor intenta más tarde o contacta al soporte.",
            status,
          };
        }

        return {
          message: this.extractErrorMessage(data) || "Error inesperado. Intenta nuevamente.",
          status,
        };
    }
  }

  /**
   * Extrae errores de campo de la respuesta del servidor
   */
  private static extractFieldErrors(data: unknown): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    if (data && typeof data === "object") {
      const response = data as any;
      
      if (response.errors && Array.isArray(response.errors)) {
        response.errors.forEach((err: any) => {
          if (err.field && err.message) {
            fieldErrors[err.field] = err.message;
          }
        });
      }
    }

    return fieldErrors;
  }

  /**
   * Extrae mensaje de error de la respuesta del servidor
   */
  private static extractErrorMessage(data: unknown): string | null {
    if (data && typeof data === "object") {
      const response = data as any;
      return response.message || null;
    }
    return null;
  }
}
