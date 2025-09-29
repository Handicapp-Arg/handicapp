import { Request } from 'express';
import { User } from '@/models/User';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      requestId?: string;
    }
  }
}

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

// Pagination types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// JWT Payload
export interface JwtPayload {
  id: number;
  email: string;
  role: number;
  iat?: number;
  exp?: number;
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

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

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

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Service response types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

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
