import { z } from 'zod';

export const tareaSchema = z.object({
  titulo: z
    .string({ required_error: 'El título es obligatorio' })
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(150, 'El título no puede exceder 150 caracteres'),

  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),

  tipo: z.enum(
    ['alimentacion', 'limpieza', 'entrenamiento', 'mantenimiento', 'veterinaria', 'administrativa', 'otro'],
    { required_error: 'El tipo es obligatorio' }
  ),

  prioridad: z.enum(['baja', 'media', 'alta', 'critica'], {
    required_error: 'La prioridad es obligatoria',
  }),

  estado: z
    .enum(['pendiente', 'en_progreso', 'completada', 'cancelada', 'vencida'])
    .default('pendiente'),

  fecha_vencimiento: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Fecha de vencimiento inválida'
    ),

  tiempo_estimado_minutos: z
    .number()
    .min(1, 'El tiempo mínimo es 1 minuto')
    .max(10080, 'El tiempo máximo es 1 semana (10080 min)')
    .optional()
    .nullable(),

  ubicacion: z
    .string()
    .max(200, 'La ubicación no puede exceder 200 caracteres')
    .optional(),

  caballo_id: z.number().optional().nullable(),
  establecimiento_id: z.number().optional().nullable(),
  asignado_a_usuario_id: z.number().optional().nullable(),
});

export type TareaFormData = z.infer<typeof tareaSchema>;
