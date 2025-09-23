// Constantes de la aplicación frontend

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: '/users',
    DELETE: '/users',
  },
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  EMAIL_INVALID: 'El formato de correo no es válido',
  PASSWORD_WEAK: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORD_MAX_LENGTH: 'La contraseña no puede exceder 128 caracteres',
  NAME_MIN_LENGTH: 'El nombre debe tener al menos 2 caracteres',
  NAME_MAX_LENGTH: 'El nombre no puede exceder 50 caracteres',
  NAME_INVALID: 'El nombre solo puede contener letras y espacios',
  PASSWORDS_NOT_MATCH: 'Las contraseñas no coinciden',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '¡Inicio de sesión exitoso!',
  REGISTER_SUCCESS: '¡Registro exitoso! Ya puedes iniciar sesión.',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
  SERVER_ERROR: 'Error del servidor. Por favor intenta más tarde.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Por favor corrige los errores en el formulario',
  GENERIC_ERROR: 'Ha ocurrido un error inesperado',
} as const;

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

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const LANGUAGES = {
  ES: 'es',
  EN: 'en',
} as const;
