import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('ASC'),
});

export const idSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['user', 'admin', 'moderator']).optional().default('user'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse({
        ...req.body,
        ...req.params,
        ...req.query,
      });
      
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input,
        }));
        
        ResponseHelper.badRequest(
          res,
          'Validation failed',
          errors.map((e: any) => e.message)
        );
        return;
      }
      
      next(error);
    }
  };
};

// Specific validation middlewares
export const validateCreateUser = validate(createUserSchema);
export const validateUpdateUser = validate(updateUserSchema);
export const validateLogin = validate(loginSchema);
export const validateChangePassword = validate(changePasswordSchema);
export const validateId = validate(idSchema);
export const validatePagination = validate(paginationSchema);
