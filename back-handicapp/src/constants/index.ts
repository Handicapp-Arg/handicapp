// Constantes de la aplicación

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  // Autenticación
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_ALREADY_EXISTS: 'El usuario ya existe',
  INVALID_TOKEN: 'Token inválido',
  TOKEN_EXPIRED: 'Token expirado',
  ACCESS_DENIED: 'Acceso denegado',
  
  // Validación
  VALIDATION_ERROR: 'Error de validación',
  REQUIRED_FIELD: 'Campo requerido',
  INVALID_EMAIL: 'Email inválido',
  WEAK_PASSWORD: 'Contraseña débil',
  
  // Base de datos
  DATABASE_ERROR: 'Error de base de datos',
  CONNECTION_ERROR: 'Error de conexión',
  
  // General
  INTERNAL_ERROR: 'Error interno del servidor',
  NOT_FOUND: 'Recurso no encontrado',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Prohibido',
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
  USER_DELETED: 'Usuario eliminado exitosamente',
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
} as const;

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  EMAIL: {
    MAX_LENGTH: 150,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  },
} as const;

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const USER_STATUS = {
  ACTIVE: 'activo',
  INACTIVE: 'inactivo',
  PENDING: 'pendiente',
  SUSPENDED: 'suspendido',
} as const;
