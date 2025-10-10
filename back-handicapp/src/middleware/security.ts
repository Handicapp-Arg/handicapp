import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import { RateLimitError } from '../utils/errors';

// CORS configuration
export const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Agregar el puerto 3002 como alternativa
    const defaultOrigins = config.cors.origin.split(',');
    const allowedOrigins = [
      ...defaultOrigins,
      'http://localhost:3002'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Rate limiting
export const rateLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, _res: Response) => {
    throw new RateLimitError('Too many requests');
  },
});

// Strict rate limiting for auth endpoints (por IP)
// En desarrollo lo salteamos para no bloquear pruebas locales (skip)
export const authRateLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs, // configurable por .env
  max: config.security.rateLimitMaxRequests,   // configurable por .env (por defecto 100 en dev)
  message: {
    success: false,
    message: 'Demasiados intentos desde esta IP. Intenta más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv === 'development',
  handler: (_req: Request, _res: Response) => {
    throw new RateLimitError('Too many authentication attempts from this IP');
  },
});

// Rate limiting por usuario (email) para login
// Previene ataques de fuerza bruta a una cuenta específica desde múltiples IPs
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export const userLoginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email?.toLowerCase();
  
  if (!email) {
    return next();
  }

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxAttempts = 10; // 10 intentos por usuario en 15 minutos

  const userAttempts = loginAttempts.get(email);

  if (userAttempts) {
    if (now > userAttempts.resetAt) {
      // Ventana expirada, resetear
      loginAttempts.set(email, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      res.status(429).json({
        success: false,
        message: `Demasiados intentos de login para esta cuenta. Intenta en ${Math.ceil((userAttempts.resetAt - now) / 60000)} minutos.`,
        code: 'RATE_LIMIT_USER'
      });
      return;
    }

    // Incrementar contador
    userAttempts.count++;
  } else {
    // Primer intento
    loginAttempts.set(email, { count: 1, resetAt: now + windowMs });
  }

  next();
};

// Limpiar intentos exitosos de login (llamar después de login exitoso)
export const clearUserLoginAttempts = (email: string) => {
  loginAttempts.delete(email.toLowerCase());
};

// Helmet security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Compression middleware
export const compressionConfig: ReturnType<typeof compression> = compression({
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// Security headers middleware
export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request ID middleware
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = req.headers['x-request-id'] as string || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Trust proxy middleware
export const trustProxy = (req: Request, _res: Response, next: NextFunction) => {
  // Trust first proxy (for rate limiting and IP detection)
  req.app.set('trust proxy', 1);
  next();
};
