import { z } from "zod";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export class ValidationService {
  /**
   * Valida los datos de registro
   */
  static validateRegister(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): ValidationResult<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }> {
    const schema = z.object({
      firstName: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
      lastName: z
        .string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras y espacios"),
      email: z
        .string()
        .email("El formato de correo no es válido")
        .max(150, "El correo no puede exceder 150 caracteres")
        .toLowerCase(),
      password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(128, "La contraseña no puede exceder 128 caracteres")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          "La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial"
        ),
      confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    });

    const result = schema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string> = {};
      
      result.error.errors.forEach((error) => {
        const path = error.path.join(".");
        errors[path] = error.message;
      });

      return { success: false, errors };
    }

    // Retornar datos sin confirmPassword
    const { confirmPassword, ...validData } = result.data;
    return { success: true, data: validData };
  }

  /**
   * Valida los datos de login
   */
  static validateLogin(data: {
    email: string;
    password: string;
  }): ValidationResult<{
    email: string;
    password: string;
  }> {
    const schema = z.object({
      email: z
        .string()
        .email("El formato de correo no es válido"),
      password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres"),
    });

    const result = schema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string> = {};
      
      result.error.errors.forEach((error) => {
        const path = error.path.join(".");
        errors[path] = error.message;
      });

      return { success: false, errors };
    }

    return { success: true, data: result.data };
  }
}
