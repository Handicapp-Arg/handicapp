/**
 * Sistema centralizado de manejo de errores
 * Proporciona mensajes descriptivos y consistentes en toda la aplicación
 */

import toast from 'react-hot-toast';

// ==================== TIPOS DE ERROR ====================

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ==================== MENSAJES DE ERROR POR CÓDIGO HTTP ====================

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Solicitud inválida. Por favor verifica los datos ingresados',
  401: 'No autorizado. Por favor inicia sesión nuevamente',
  403: 'No tienes permisos para realizar esta acción',
  404: 'No se encontró el recurso solicitado',
  409: 'El recurso ya existe o hay un conflicto',
  422: 'Los datos proporcionados no son válidos',
  429: 'Demasiadas solicitudes. Por favor intenta más tarde',
  500: 'Error del servidor. Por favor intenta más tarde',
  502: 'Error de conexión con el servidor',
  503: 'Servicio no disponible temporalmente',
};

// ==================== MENSAJES DE ERROR POR CONTEXTO ====================

const CONTEXT_ERROR_MESSAGES: Record<string, Record<string, string>> = {
  auth: {
    login_failed: 'Credenciales incorrectas. Verifica tu email y contraseña',
    email_not_verified: 'Tu email no ha sido verificado. Revisa tu correo',
    account_disabled: 'Tu cuenta está deshabilitada. Contacta al administrador',
    session_expired: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
    invalid_token: 'Token de autenticación inválido',
  },
  user: {
    create_failed: 'No se pudo crear el usuario',
    update_failed: 'No se pudo actualizar el usuario',
    delete_failed: 'No se pudo eliminar el usuario',
    not_found: 'Usuario no encontrado',
    email_exists: 'El email ya está registrado',
    invalid_role: 'Rol de usuario inválido',
  },
  establecimiento: {
    create_failed: 'No se pudo crear el establecimiento',
    update_failed: 'No se pudo actualizar el establecimiento',
    delete_failed: 'No se pudo eliminar el establecimiento',
    not_found: 'Establecimiento no encontrado',
    admin_creation_failed: 'No se pudo crear el usuario administrador del establecimiento',
  },
  caballo: {
    create_failed: 'No se pudo crear el caballo',
    update_failed: 'No se pudo actualizar el caballo',
    delete_failed: 'No se pudo eliminar el caballo',
    not_found: 'Caballo no encontrado',
    invalid_state: 'Estado del caballo inválido',
  },
  evento: {
    create_failed: 'No se pudo crear el evento',
    update_failed: 'No se pudo actualizar el evento',
    delete_failed: 'No se pudo eliminar el evento',
    not_found: 'Evento no encontrado',
    invalid_date: 'La fecha del evento es inválida',
  },
  tarea: {
    create_failed: 'No se pudo crear la tarea',
    update_failed: 'No se pudo actualizar la tarea',
    delete_failed: 'No se pudo eliminar la tarea',
    assign_failed: 'No se pudo asignar la tarea',
    complete_failed: 'No se pudo completar la tarea',
    not_found: 'Tarea no encontrada',
  },
  file: {
    upload_failed: 'Error al subir el archivo',
    download_failed: 'Error al descargar el archivo',
    delete_failed: 'Error al eliminar el archivo',
    invalid_format: 'Formato de archivo no válido',
    file_too_large: 'El archivo es demasiado grande',
  },
  network: {
    timeout: 'La solicitud tardó demasiado. Verifica tu conexión',
    offline: 'Sin conexión a internet',
    connection_failed: 'Error de conexión con el servidor',
  },
};

// ==================== MENSAJES DE ÉXITO ====================

const SUCCESS_MESSAGES: Record<string, Record<string, string>> = {
  user: {
    created: 'Usuario creado exitosamente',
    updated: 'Usuario actualizado exitosamente',
    deleted: 'Usuario eliminado exitosamente',
  },
  establecimiento: {
    created: 'Establecimiento creado exitosamente',
    updated: 'Establecimiento actualizado exitosamente',
    deleted: 'Establecimiento eliminado exitosamente',
  },
  caballo: {
    created: 'Caballo creado exitosamente',
    updated: 'Caballo actualizado exitosamente',
    deleted: 'Caballo eliminado exitosamente',
  },
  evento: {
    created: 'Evento creado exitosamente',
    updated: 'Evento actualizado exitosamente',
    deleted: 'Evento eliminado exitosamente',
  },
  tarea: {
    created: 'Tarea creada exitosamente',
    updated: 'Tarea actualizada exitosamente',
    deleted: 'Tarea eliminada exitosamente',
    assigned: 'Tarea asignada exitosamente',
    completed: 'Tarea completada exitosamente',
  },
  file: {
    uploaded: 'Archivo subido exitosamente',
    deleted: 'Archivo eliminado exitosamente',
  },
};

// ==================== FUNCIONES HELPER ====================

/**
 * Extrae el mensaje de error de diferentes estructuras de respuesta
 */
function extractErrorMessage(error: any): string {
  // Error con mensaje directo
  if (typeof error === 'string') return error;
  
  // Error de Axios/Fetch con response
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  
  // Error con message
  if (error.message) return error.message;
  
  // Error de red
  if (error.code === 'ECONNABORTED') return CONTEXT_ERROR_MESSAGES.network.timeout;
  if (error.code === 'ERR_NETWORK') return CONTEXT_ERROR_MESSAGES.network.connection_failed;
  
  return 'Ha ocurrido un error inesperado';
}

/**
 * Obtiene el código de estado HTTP del error
 */
function getStatusCode(error: any): number | undefined {
  return error.response?.status || error.status;
}

/**
 * Construye un objeto ApiError estructurado
 */
export function parseError(error: any, context?: string): ApiError {
  const message = extractErrorMessage(error);
  const status = getStatusCode(error);
  
  return {
    message,
    status,
    code: error.code || error.response?.data?.code,
    field: error.response?.data?.field,
    details: error.response?.data?.details || error.response?.data,
  };
}

/**
 * Obtiene un mensaje de error descriptivo basado en el contexto y código
 */
export function getErrorMessage(error: any, context?: string, action?: string): string {
  const parsedError = parseError(error, context);
  
  // 1. Mensaje del servidor (más específico)
  if (parsedError.message && parsedError.message !== 'Request failed') {
    return parsedError.message;
  }
  
  // 2. Mensaje por contexto y acción
  if (context && action && CONTEXT_ERROR_MESSAGES[context]?.[action]) {
    return CONTEXT_ERROR_MESSAGES[context][action];
  }
  
  // 3. Mensaje por código HTTP
  if (parsedError.status && HTTP_ERROR_MESSAGES[parsedError.status]) {
    return HTTP_ERROR_MESSAGES[parsedError.status];
  }
  
  // 4. Fallback genérico
  return parsedError.message || 'Ha ocurrido un error inesperado';
}

/**
 * Obtiene un mensaje de éxito descriptivo
 */
export function getSuccessMessage(context: string, action: string): string {
  return SUCCESS_MESSAGES[context]?.[action] || 'Operación completada exitosamente';
}

// ==================== FUNCIONES DE NOTIFICACIÓN ====================

/**
 * Muestra un mensaje de error con formato consistente
 */
export function showError(error: any, context?: string, action?: string) {
  const message = getErrorMessage(error, context, action);
  const parsedError = parseError(error, context);
  
  // Agregar detalles adicionales si existen
  let fullMessage = message;
  if (parsedError.field) {
    fullMessage += ` (Campo: ${parsedError.field})`;
  }
  if (parsedError.code && parsedError.code !== 'ERR_BAD_REQUEST') {
    fullMessage += ` [${parsedError.code}]`;
  }
  
  toast.error(fullMessage, {
    duration: 5000,
    position: 'top-right',
  });
}

/**
 * Muestra un mensaje de éxito con formato consistente
 */
export function showSuccess(context: string, action: string, customMessage?: string) {
  const message = customMessage || getSuccessMessage(context, action);
  
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
}

/**
 * Muestra un mensaje de advertencia
 */
export function showWarning(message: string) {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
  });
}

/**
 * Muestra un mensaje informativo
 */
export function showInfo(message: string) {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
  });
}

// ==================== VALIDACIÓN ====================

/**
 * Valida errores de formulario y retorna mensajes descriptivos
 */
export function validateFormErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return `${errors[0].field}: ${errors[0].message}`;
  }
  
  return `Se encontraron ${errors.length} errores:\n${errors.map(e => `• ${e.field}: ${e.message}`).join('\n')}`;
}

/**
 * Maneja errores de validación de campos
 */
export function handleValidationError(error: any) {
  const parsedError = parseError(error);
  
  if (parsedError.details && Array.isArray(parsedError.details)) {
    const validationErrors = parsedError.details as ValidationError[];
    showError(validateFormErrors(validationErrors));
  } else {
    showError(error);
  }
}

// ==================== WRAPPER PARA OPERACIONES ASYNC ====================

/**
 * Wrapper para operaciones async con manejo de errores automático
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  action: string,
  options?: {
    successMessage?: string;
    showSuccessToast?: boolean;
    onError?: (error: any) => void;
    onSuccess?: (result: T) => void;
  }
): Promise<T | null> {
  try {
    const result = await operation();
    
    if (options?.showSuccessToast !== false) {
      showSuccess(context, action, options?.successMessage);
    }
    
    options?.onSuccess?.(result);
    return result;
  } catch (error) {
    showError(error, context, action);
    options?.onError?.(error);
    return null;
  }
}
