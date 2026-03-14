import { z } from 'zod';

export const eventoSchema = z.object({
  titulo: z
    .string({ required_error: 'El título es obligatorio' })
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),

  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),

  tipo_evento_id: z
    .number({ required_error: 'El tipo de evento es obligatorio' })
    .min(1, 'Seleccioná un tipo de evento'),

  fecha_evento: z
    .string({ required_error: 'La fecha del evento es obligatoria' })
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha del evento inválida'),

  fecha_fin: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Fecha de fin inválida'
    ),

  estado: z
    .enum(['draft', 'pending_review', 'approved', 'rejected', 'completado', 'cancelado'])
    .default('draft'),

  caballo_id: z.number().optional().nullable(),
  establecimiento_id: z.number().optional().nullable(),
  veterinario_id: z.number().optional().nullable(),

  resultado: z
    .string()
    .max(500, 'El resultado no puede exceder 500 caracteres')
    .optional(),

  observaciones: z
    .string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional(),
}).refine(
  (data) => {
    if (data.fecha_fin && data.fecha_evento) {
      return new Date(data.fecha_fin) >= new Date(data.fecha_evento);
    }
    return true;
  },
  {
    message: 'La fecha de fin debe ser posterior a la fecha del evento',
    path: ['fecha_fin'],
  }
);

export type EventoFormData = z.infer<typeof eventoSchema>;
