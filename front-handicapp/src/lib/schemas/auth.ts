import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "El correo es obligatorio" })
    .email("El formato de correo no es válido")
    .max(150, "El correo no puede exceder 150 caracteres")
    .toLowerCase(),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
  firstName: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
  lastName: z
    .string({ required_error: "El apellido es obligatorio" })
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras y espacios"),
  email: z
    .string({ required_error: "El correo es obligatorio" })
    .email("El formato de correo no es válido")
    .max(150, "El correo no puede exceder 150 caracteres")
    .toLowerCase(),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña no puede exceder 128 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial"
    ),
  confirmPassword: z
    .string({ required_error: "Confirma tu contraseña" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
