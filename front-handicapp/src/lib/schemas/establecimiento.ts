import { z } from 'zod';

export const establecimientoSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres'),

  tipo: z
    .enum(['haras', 'club_hipico', 'escuela', 'pista', 'otro'])
    .optional(),

  descripcion: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),

  direccion: z
    .string()
    .max(300, 'La dirección no puede exceder 300 caracteres')
    .optional(),

  ciudad: z
    .string()
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional(),

  provincia: z
    .string()
    .max(100, 'La provincia no puede exceder 100 caracteres')
    .optional(),

  pais: z
    .string()
    .max(100, 'El país no puede exceder 100 caracteres')
    .default('Argentina'),

  codigo_postal: z
    .string()
    .max(20, 'El código postal no puede exceder 20 caracteres')
    .optional(),

  telefono: z
    .string()
    .max(30, 'El teléfono no puede exceder 30 caracteres')
    .optional(),

  email: z
    .string()
    .email('El formato de email no es válido')
    .max(150, 'El email no puede exceder 150 caracteres')
    .optional()
    .or(z.literal('')),

  sitio_web: z
    .string()
    .url('El formato de URL no es válido')
    .max(200, 'La URL no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),

  capacidad_caballos: z
    .number()
    .min(1, 'La capacidad mínima es 1 caballo')
    .max(10000, 'La capacidad máxima es 10000 caballos')
    .optional()
    .nullable(),

  estado: z.enum(['activo', 'inactivo']).default('activo'),
});

export type EstablecimientoFormData = z.infer<typeof establecimientoSchema>;
