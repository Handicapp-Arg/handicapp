import { z } from 'zod';

export const caballoSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  sexo: z.enum(['macho', 'hembra', 'castrado'], {
    required_error: 'El sexo es obligatorio',
  }),

  fecha_nacimiento: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Fecha de nacimiento inválida'
    ),

  color: z
    .string()
    .max(50, 'El color no puede exceder 50 caracteres')
    .optional(),

  raza: z
    .string()
    .max(100, 'La raza no puede exceder 100 caracteres')
    .optional(),

  altura_cm: z
    .number()
    .min(50, 'La altura mínima es 50 cm')
    .max(300, 'La altura máxima es 300 cm')
    .optional()
    .nullable(),

  peso_kg: z
    .number()
    .min(50, 'El peso mínimo es 50 kg')
    .max(2000, 'El peso máximo es 2000 kg')
    .optional()
    .nullable(),

  numero_rp: z
    .string()
    .max(50, 'El RP no puede exceder 50 caracteres')
    .optional(),

  numero_sba: z
    .string()
    .max(50, 'El SBA no puede exceder 50 caracteres')
    .optional(),

  estado_salud: z
    .enum(['saludable', 'en_tratamiento', 'recuperacion', 'critico'])
    .optional(),

  estado: z
    .enum(['activo', 'inactivo', 'vendido', 'fallecido'])
    .default('activo'),

  descripcion: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),

  padre_id: z.number().optional().nullable(),
  madre_id: z.number().optional().nullable(),
});

export type CaballoFormData = z.infer<typeof caballoSchema>;
