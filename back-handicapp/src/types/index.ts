// src/types/index.ts
// -----------------------------------------------------------------------------
// HandicApp API - Types & Interfaces
// -----------------------------------------------------------------------------

import { Request } from 'express';

// ====================================
// USER & AUTHENTICATION TYPES
// ====================================

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string | undefined;
  activo: boolean;
  rol?: {
    id: number;
    clave: string;
    nombre: string;
  } | undefined;
  creado_el: Date;
  actualizado_el: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      requestId?: string;
    }
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  nombre: string;
  apellido: string;
  telefono?: string;
  rolId: number;
}

export interface TokenPayload {
  userId: number;
  email: string;
  rol?: string;
  iat?: number;
  exp?: number;
}

// JWT Payload
export interface JwtPayload {
  id: number;
  email: string;
  role: number;
  iat?: number;
  exp?: number;
}

// ====================================
// BUSINESS ENTITY TYPES
// ====================================

export interface CreateEstablecimientoData {
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  descripcion?: string;
  creadoPorUsuarioId: number;
  // Campos opcionales del modelo
  cuit?: string;
  direccion_numero?: string;
  direccion_complemento?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  disciplina_principal?: string;
}

export interface CreateCaballoData {
  nombre: string;
  raza: string;
  sexo: 'macho' | 'hembra';
  fechaNacimiento: Date;
  color?: string;
  alzada?: number;
  peso?: number;
  chip?: string;
  pasaporte?: string;
  establecimientoId?: number;
  propietarioId?: number;
  padreId?: number;
  madreId?: number;
  observaciones?: string;
  creadoPorUsuarioId: number;
}

export interface CreateEventoData {
  fecha: Date;
  tipoEventoId: number;
  caballoId: number;
  establecimientoId?: number;
  descripcion?: string;
  observaciones?: string;
  veterinarioId?: number;
  temperatura?: number;
  peso?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  resultados?: string;
  costo?: number;
  creadoPorUsuarioId: number;
  adjuntos?: CreateAdjuntoData[];
}

export interface CreateTareaData {
  titulo: string;
  descripcion: string;
  fechaVencimiento: Date;
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
  estado?: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada' | 'vencida';
  asignadoAUsuarioId?: number;
  caballoId?: number;
  establecimientoId?: number;
  categoria?: string;
  frecuencia?: string;
  instrucciones?: string;
  observaciones?: string;
  creadoPorUsuarioId: number;
}

export interface CreateAdjuntoData {
  nombre: string;
  descripcion?: string;
  url: string;
  tipo?: 'imagen' | 'documento' | 'video' | 'audio';
  creadoPorUsuarioId: number;
}

// User types
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// ====================================
// QUERY & FILTER TYPES
// ====================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface EstablecimientoQuery extends PaginationQuery {
  usuarioId: number;
  userRole?: string;
}

export interface CaballoQuery extends PaginationQuery {
  establecimientoId?: number;
  raza?: string;
  sexo?: string;
  usuarioId: number;
  userRole?: string;
}

export interface EventoQuery extends PaginationQuery {
  caballoId?: number;
  tipoEventoId?: number;
  establecimientoId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  veterinarioId?: number;
  usuarioId: number;
  userRole?: string;
}

export interface TareaQuery extends PaginationQuery {
  estado?: string;
  prioridad?: string;
  categoria?: string;
  asignadoAUsuarioId?: number;
  caballoId?: number;
  establecimientoId?: number;
  fechaVencimientoInicio?: string;
  fechaVencimientoFin?: string;
  usuarioId: number;
  userRole?: string;
}

// ====================================
// RESPONSE TYPES
// ====================================

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ====================================
// ERROR TYPES
// ====================================

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// ====================================
// CONFIGURATION TYPES
// ====================================

// Database types
export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  dialect: string;
  logging: boolean;
}

// Cache types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string;
}

// ====================================
// FILE & UPLOAD TYPES
// ====================================

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// ====================================
// MIDDLEWARE TYPES
// ====================================

// Middleware types
export interface AuthRequest extends Request {
  user: User;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

// ====================================
// AUDIT & LOGGING TYPES
// ====================================

export interface AuditLogData {
  accion: string;
  tabla_nombre: string;
  registro_id: number;
  valores_anteriores?: any;
  valores_nuevos?: any;
  usuario_id?: number;
  ip_address?: string;
  user_agent?: string;
}

// ====================================
// BUSINESS LOGIC TYPES
// ====================================

export interface EstadisticasEstablecimiento {
  totalCaballos: number;
  totalUsuarios: number;
  totalEventos: number;
  eventosPorMes: Record<string, number>;
}

export interface EstadisticasCaballo {
  totalEventos: number;
  ultimoEvento?: Date;
  eventosPorTipo: Record<string, number>;
}

export interface EstadisticasEventos {
  totalEventos: number;
  eventosPorTipo: Record<string, number>;
  ultimoEvento?: Date;
}

export interface EstadisticasTareas {
  totalTareas: number;
  tareasCompletadas: number;
  tareasPendientes: number;
  tareasVencidas: number;
  productividad: number;
}

export interface ProductividadUsuario {
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
  };
  periodo: {
    fechaInicio: string;
    fechaFin: string;
  };
  estadisticas: {
    tareasAsignadas: number;
    tareasCompletadas: number;
    tareasVencidas: number;
    porcentajeCompletado: number;
    tiempoPromedioCompletion: number;
  };
}
