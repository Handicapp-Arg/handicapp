// src/middleware/validation.ts
// -----------------------------------------------------------------------------
// HandicApp API - Middleware de Validación
// -----------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Middleware para manejar errores de validación
 */
export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    logger.warn('Errores de validación', {
      path: req.path,
      method: req.method,
      errors: formattedErrors,
    });

    res
      .status(400)
      .json(
        ApiResponse.error(
          'Errores de validación',
          formattedErrors.map(e => e.message),
        ),
      );
    return;
  }
  
  next();
}

// ====================================
// VALIDACIONES COMUNES
// ====================================

export const commonValidations = {
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),

  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Límite debe ser un número entre 1 y 1000'),

  search: query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Búsqueda debe ser texto de máximo 255 caracteres'),

  fecha: (field: string) => body(field)
    .isISO8601()
    .withMessage(`${field} debe ser una fecha válida (YYYY-MM-DD)`),

  fechaOpcional: (field: string) => body(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} debe ser una fecha válida (YYYY-MM-DD)`),

  email: (field: string = 'email') => body(field)
    .optional()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage(`${field} debe ser un email válido`),

  telefono: (field: string = 'telefono') => body(field)
    .optional()
    .matches(/^[\+]?[\d\s\-\(\)]{7,20}$/)
    .withMessage(`${field} debe ser un número de teléfono válido`)
};

// ====================================
// VALIDACIONES DE USUARIO
// ====================================

export const userValidations = {
  publicRegister: [
    body('email')
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false })
      .withMessage('Email es requerido y debe ser válido'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/)
      .withMessage('La contraseña debe contener: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'),
    body('nombre')
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre es requerido y debe tener entre 2 y 100 caracteres'),
    body('apellido')
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Apellido es requerido y debe tener entre 2 y 100 caracteres'),
    commonValidations.telefono('telefono'),
    handleValidationErrors
  ],
  create: [
    body('email')
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false })
      .withMessage('Email es requerido y debe ser válido'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
    
    body('nombre')
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre es requerido y debe tener entre 2 y 100 caracteres'),
    
    body('apellido')
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Apellido es requerido y debe tener entre 2 y 100 caracteres'),
    
    body('telefono')
      .optional()
      .matches(/^[\+]?[\d\s\-\(\)]{7,20}$/)
      .withMessage('Teléfono debe ser un número válido'),
    
    body('documento')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Documento debe tener máximo 50 caracteres'),
    
    body('departamento_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Departamento debe ser un ID válido'),
    
    body('puesto_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Puesto debe ser un ID válido'),
    
    body('rol_id')
      .isInt({ min: 1 })
      .withMessage('Rol es requerido y debe ser válido'),

    handleValidationErrors
  ],

  update: [
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false })
      .withMessage('Email debe ser válido'),
    
    body('nombre')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
    
    body('apellido')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Apellido debe tener entre 2 y 100 caracteres'),
    
    body('ubicacion')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 150 })
      .withMessage('Ubicación debe tener máximo 150 caracteres'),
    
    body('telefono')
      .optional()
      .matches(/^[\+]?[\d\s\-\(\)]{7,20}$/)
      .withMessage('Teléfono debe ser un número válido'),
    
    body('documento')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Documento debe tener máximo 50 caracteres'),
    
    body('departamento_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Departamento debe ser un ID válido'),
    
    body('puesto_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Puesto debe ser un ID válido'),

    handleValidationErrors
  ],

  changePassword: [
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('La nueva contraseña debe tener entre 8 y 128 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),

    handleValidationErrors
  ]
};

// ====================================
// VALIDACIONES DE ESTABLECIMIENTO
// ====================================

export const establecimientoValidations = {
  create: [
    body('nombre')
      .isString()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Nombre es requerido y debe tener entre 2 y 200 caracteres'),
    
    body('cuit')
      .isString()
      .trim()
      .isLength({ min: 11, max: 13 })
      .withMessage('CUIT es requerido y debe tener entre 11 y 13 caracteres'),
    
    body('direccion_calle')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Dirección debe tener entre 1 y 500 caracteres'),
    
    body('direccion_numero')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Número de dirección debe tener máximo 50 caracteres'),
    
    body('direccion_complemento')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Complemento de dirección debe tener máximo 200 caracteres'),
    
    body('codigo_postal')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Código postal debe tener máximo 20 caracteres'),
    
    body('ciudad')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Ciudad debe tener máximo 100 caracteres'),
    
    body('provincia')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Provincia debe tener máximo 100 caracteres'),
    
    body('pais')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('País debe tener máximo 100 caracteres'),
    
    body('latitud')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (value === '' || value === null || value === undefined) return true;
        const num = Number(value);
        if (isNaN(num) || num < -90 || num > 90) {
          throw new Error('Latitud debe ser un número entre -90 y 90');
        }
        return true;
      }),
    
    body('longitud')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (value === '' || value === null || value === undefined) return true;
        const num = Number(value);
        if (isNaN(num) || num < -180 || num > 180) {
          throw new Error('Longitud debe ser un número entre -180 y 180');
        }
        return true;
      }),
    
    body('tipo_establecimiento')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isIn(['haras', 'polo', 'salto', 'doma', 'turf', 'enduro', 'mixto', 'otro'])
      .withMessage('Tipo de establecimiento debe ser válido'),
    
    body('estado')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isIn(['activo', 'inactivo', 'mantenimiento', 'suspendido'])
      .withMessage('Estado debe ser válido'),
    
    body('superficie_hectareas')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (value === '' || value === null || value === undefined) return true;
        const num = Number(value);
        if (isNaN(num) || num < 0) {
          throw new Error('Superficie debe ser un número positivo');
        }
        return true;
      }),
    
    body('cantidad_boxes')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (value === '' || value === null || value === undefined) return true;
        const num = Number(value);
        if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
          throw new Error('Cantidad de boxes debe ser un número entero positivo');
        }
        return true;
      }),
    
    body('servicios')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (value === '' || value === null || value === undefined) return true;
        if (!Array.isArray(value)) {
          throw new Error('Servicios debe ser un array');
        }
        return true;
      }),
    
    body('disciplina_principal')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Disciplina principal debe tener máximo 100 caracteres'),
    
    commonValidations.telefono('telefono'),
    commonValidations.email('email'),
    
    body('descripcion')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Descripción debe tener máximo 1000 caracteres'),

    handleValidationErrors
  ],

  update: [
    body('nombre')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Nombre debe tener entre 2 y 200 caracteres'),
    
    body('direccion_calle')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Dirección debe tener entre 5 y 500 caracteres'),
    
    commonValidations.telefono('telefono'),
    commonValidations.email('email'),
    
    body('descripcion')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Descripción debe tener máximo 1000 caracteres'),

    handleValidationErrors
  ],

  addUser: [
    body('usuarioId')
      .isInt({ min: 1 })
      .withMessage('ID de usuario es requerido y debe ser válido'),
    
    body('rolEnEstablecimiento')
      .isIn(['propietario'])
      .withMessage('Rol en establecimiento debe ser válido'),
    
    commonValidations.fechaOpcional('fechaInicio'),

    handleValidationErrors
  ]
};

// ====================================
// VALIDACIONES DE CABALLO
// ====================================

export const caballoValidations = {
  create: [
    body('nombre')
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre es requerido y debe tener entre 2 y 100 caracteres'),
    
    body('raza')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Raza debe tener entre 2 y 100 caracteres'),
    
    body('sexo')
      .isIn(['macho', 'hembra'])
      .withMessage('Sexo debe ser macho o hembra'),
    
  commonValidations.fecha('fecha_nacimiento'),
    
    body('color')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Color debe tener máximo 50 caracteres'),
    
    body('alzada')
      .optional()
      .isFloat({ min: 0.5, max: 3.0 })
      .withMessage('Alzada debe estar entre 0.5 y 3.0 metros'),
    
    body('peso')
      .optional()
      .isFloat({ min: 50, max: 1500 })
      .withMessage('Peso debe estar entre 50 y 1500 kg'),
    
    body('chip')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Chip debe tener máximo 50 caracteres'),
    
    body('pasaporte')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Pasaporte debe tener máximo 50 caracteres'),
    
    body('establecimientoId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de establecimiento debe ser válido'),
    
    body('propietarioId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de propietario debe ser válido'),
    
    body('padreId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID del padre debe ser válido'),
    
    body('madreId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de la madre debe ser válido'),

    handleValidationErrors
  ],

  update: [
    body('nombre')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
    
    body('raza')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Raza debe tener entre 2 y 100 caracteres'),
    
    body('sexo')
      .optional()
      .isIn(['macho', 'hembra'])
      .withMessage('Sexo debe ser macho o hembra'),
    
  commonValidations.fechaOpcional('fecha_nacimiento'),
    
    body('color')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Color debe tener máximo 50 caracteres'),
    
    body('alzada')
      .optional()
      .isFloat({ min: 0.5, max: 3.0 })
      .withMessage('Alzada debe estar entre 0.5 y 3.0 metros'),
    
    body('peso')
      .optional()
      .isFloat({ min: 50, max: 1500 })
      .withMessage('Peso debe estar entre 50 y 1500 kg'),

    handleValidationErrors
  ],

  addPropietario: [
    body('propietarioId')
      .isInt({ min: 1 })
      .withMessage('ID de propietario es requerido y debe ser válido'),
    
    commonValidations.fechaOpcional('fechaInicio'),
    
    body('porcentaje')
      .optional()
      .isFloat({ min: 0.1, max: 100 })
      .withMessage('Porcentaje debe estar entre 0.1 y 100'),

    handleValidationErrors
  ]
};

// ====================================
// VALIDACIONES DE EVENTO
// ====================================

export const eventoValidations = {
  create: [
    commonValidations.fecha('fecha_evento'),
    
    body('tipo_evento_id')
      .isInt({ min: 1 })
      .withMessage('Tipo de evento es requerido y debe ser válido'),
    
    body('caballo_id')
      .isInt({ min: 1 })
      .withMessage('Caballo es requerido y debe ser válido'),
    
    body('establecimiento_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de establecimiento debe ser válido'),
    
    body('descripcion')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Descripción debe tener máximo 1000 caracteres'),
    
    body('temperatura')
      .optional()
      .isFloat({ min: 30, max: 45 })
      .withMessage('Temperatura debe estar entre 30 y 45 grados'),
    
    body('peso')
      .optional()
      .isFloat({ min: 50, max: 1500 })
      .withMessage('Peso debe estar entre 50 y 1500 kg'),
    
    body('frecuenciaCardiaca')
      .optional()
      .isInt({ min: 20, max: 200 })
      .withMessage('Frecuencia cardíaca debe estar entre 20 y 200 bpm'),
    
    body('frecuenciaRespiratoria')
      .optional()
      .isInt({ min: 5, max: 80 })
      .withMessage('Frecuencia respiratoria debe estar entre 5 y 80 rpm'),
    
    body('costo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Costo debe ser un número positivo'),

    handleValidationErrors
  ],

  update: [
    commonValidations.fechaOpcional('fecha_evento'),
    
    body('tipo_evento_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Tipo de evento debe ser válido'),
    
    body('descripcion')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Descripción debe tener máximo 1000 caracteres'),
    
    body('temperatura')
      .optional()
      .isFloat({ min: 30, max: 45 })
      .withMessage('Temperatura debe estar entre 30 y 45 grados'),
    
    body('peso')
      .optional()
      .isFloat({ min: 50, max: 1500 })
      .withMessage('Peso debe estar entre 50 y 1500 kg'),

    handleValidationErrors
  ],

  addAdjunto: [
    body('nombre')
      .isString()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nombre es requerido y debe tener entre 1 y 255 caracteres'),
    
    body('url')
      .isURL()
      .withMessage('URL debe ser válida'),
    
    body('descripcion')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Descripción debe tener máximo 500 caracteres'),
    
    body('tipo')
      .optional()
      .isIn(['imagen', 'documento', 'video', 'audio'])
      .withMessage('Tipo debe ser válido'),

    handleValidationErrors
  ]
};

// ====================================
// VALIDACIONES DE TAREA
// ====================================

export const tareaValidations = {
  create: [
    body('titulo')
      .isString()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Título es requerido y debe tener entre 2 y 200 caracteres'),
    
    body('descripcion')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Descripción debe tener entre 1 y 1000 caracteres'),
    
    commonValidations.fecha('fechaVencimiento'),
    
    body('prioridad')
      .optional()
      .isIn(['baja', 'media', 'alta', 'critica'])
      .withMessage('Prioridad debe ser válida'),
    
    body('estado')
      .optional()
      .isIn(['pendiente', 'en_progreso', 'completada', 'cancelada', 'vencida'])
      .withMessage('Estado debe ser válido'),
    
    body('tipo')
      .optional()
      .isString()
      .trim()
      .withMessage('Tipo debe ser válido'),
    
    body('tiempoEstimadoMinutos')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Tiempo estimado debe ser un número positivo'),
    
    body('ubicacion')
      .optional()
      .isString()
      .trim()
      .withMessage('Ubicación debe ser válida'),
    
    body('asignadoAUsuarioId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de usuario asignado debe ser válido'),
    
    body('caballoId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de caballo debe ser válido'),
    
    body('establecimientoId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de establecimiento debe ser válido'),
    
    body('categoria')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Categoría debe tener máximo 100 caracteres'),

    handleValidationErrors
  ],

  update: [
    body('titulo')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Título debe tener entre 2 y 200 caracteres'),
    
    body('descripcion')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Descripción debe tener entre 1 y 1000 caracteres'),
    
    commonValidations.fechaOpcional('fechaVencimiento'),
    
    body('prioridad')
      .optional()
      .isIn(['baja', 'media', 'alta', 'critica'])
      .withMessage('Prioridad debe ser válida'),
    
    body('estado')
      .optional()
      .isIn(['pendiente', 'en_progreso', 'completada', 'cancelada', 'vencida'])
      .withMessage('Estado debe ser válido'),

    handleValidationErrors
  ],

  cambiarEstado: [
    body('nuevoEstado')
      .isIn(['pendiente', 'en_progreso', 'completada', 'cancelada', 'vencida'])
      .withMessage('Nuevo estado es requerido y debe ser válido'),
    
    body('observaciones')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Observaciones debe tener máximo 1000 caracteres'),

    handleValidationErrors
  ],

  asignar: [
    body('asignadoAUsuarioId')
      .isInt({ min: 1 })
      .withMessage('ID de usuario asignado es requerido y debe ser válido'),
    
    body('observaciones')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Observaciones debe tener máximo 1000 caracteres'),

    handleValidationErrors
  ]
};

// ====================================
// VALIDACIONES DE PARÁMETROS
// ====================================

export const paramValidations = {
  id: [commonValidations.id, handleValidationErrors],
  
  pagination: [
    commonValidations.page,
    commonValidations.limit,
    handleValidationErrors
  ],

  dateRange: [
    query('fechaInicio')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio debe ser válida (YYYY-MM-DD)'),
    
    query('fechaFin')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin debe ser válida (YYYY-MM-DD)'),

    handleValidationErrors
  ]
};