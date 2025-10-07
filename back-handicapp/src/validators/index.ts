import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ResponseHelper } from "../utils/response";

// -----------------------------------------------------------------------------
// Shared helpers
// -----------------------------------------------------------------------------
const handleValidationError = (error: unknown, res: Response): boolean => {
  if (error instanceof z.ZodError) {
    const messages = error.issues.map((issue) => issue.message);
    ResponseHelper.badRequest(res, "Validation failed", messages);
    return true;
  }

  return false;
};

const createValidator = <T>(
  schema: z.ZodSchema<T>,
  pick: (req: Request) => unknown,
  assign: (req: Request, parsed: T) => void
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(pick(req));
      assign(req, parsed);
      next();
    } catch (error) {
      if (!handleValidationError(error, res)) {
        next(error);
      }
    }
  };
};

// -----------------------------------------------------------------------------
// Common validation schemas
// -----------------------------------------------------------------------------
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  sortBy: z.string().trim().min(1).optional(),
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("ASC"),
});

export const idSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

// -----------------------------------------------------------------------------
// User validation schemas
// -----------------------------------------------------------------------------
export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  role: z.enum(["user", "admin", "moderator"]).optional().default("user"),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
  role: z.enum(["user", "admin", "moderator"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// -----------------------------------------------------------------------------
// Role validation schemas
// -----------------------------------------------------------------------------
const roleKeySchema = z
  .string()
  .trim()
  .min(2, "Clave debe tener al menos 2 caracteres")
  .max(50, "Clave no puede superar 50 caracteres")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Clave solo admite letras, numeros, puntos, guiones y guiones bajos")
  .transform((value) => value.toLowerCase());

const roleNameSchema = z
  .string()
  .trim()
  .min(2, "Nombre debe tener al menos 2 caracteres")
  .max(80, "Nombre no puede superar 80 caracteres");

export const createRoleSchema = z.object({
  clave: roleKeySchema,
  nombre: roleNameSchema,
});

export const updateRoleSchema = z
  .object({
    clave: roleKeySchema.optional(),
    nombre: roleNameSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.clave && !data.nombre) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe proporcionar al menos un campo para actualizar",
      });
    }
  });

export const roleIdSchema = z.object({
  id: z.coerce
    .number()
    .refine((v) => Number.isFinite(v), { message: 'El identificador debe ser numerico' })
    .int('El identificador debe ser un entero')
    .positive('El identificador debe ser mayor a cero'),
});

// -----------------------------------------------------------------------------
// Generic validation factories
// -----------------------------------------------------------------------------
export const validate = (schema: z.ZodSchema) =>
  createValidator(schema, (req) => ({ ...req.body, ...req.params, ...req.query }), (req, parsed) => {
    req.body = parsed as Request["body"];
  });

export const validateBody = <T>(schema: z.ZodSchema<T>) =>
  createValidator(schema, (req) => req.body, (req, parsed) => {
    req.body = parsed as Request["body"];
  });

export const validateParams = <T>(schema: z.ZodSchema<T>) =>
  createValidator(schema, (req) => req.params, (req, parsed) => {
    req.params = parsed as unknown as Request["params"];
  });

export const validateQuery = <T>(schema: z.ZodSchema<T>) =>
  createValidator(schema, (req) => req.query, (_req, _parsed) => {
    // Query validation only, no assignment needed since req.query is read-only
  });

// -----------------------------------------------------------------------------
// Specific validation middlewares
// -----------------------------------------------------------------------------
export const validateCreateUser = validate(createUserSchema);
export const validateUpdateUser = validate(updateUserSchema);
export const validateLogin = validate(loginSchema);
export const validateChangePassword = validate(changePasswordSchema);
export const validateId = validate(idSchema);
export const validatePagination = validateQuery(paginationSchema);
export const validateRoleCreate = validateBody(createRoleSchema);
export const validateRoleUpdate = validateBody(updateRoleSchema);
export const validateRoleId = validateParams(roleIdSchema);
