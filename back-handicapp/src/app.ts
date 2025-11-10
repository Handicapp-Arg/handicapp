import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { config } from './config/config';
import { config as appConfig } from './config/config';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './utils/errors';
import { requestLogger } from './utils/logger';

const app: Express = express();

// 🚀 PERFORMANCE: Gzip/Brotli Compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balance entre compresión y CPU
}));

const allowedOrigins = [
  'https://www.handicapp.com.ar',
  'https://handicapp.com.ar',
  'https://api.handicapp.com.ar',
  'https://qa.handicapp.com.ar',
  'https://api-qa.handicapp.com.ar',
  'http://handicapp.com.ar',
  'http://www.handicapp.com.ar',
  'http://localhost:3000',
  'http://localhost:3001',
];

// 🚀 CORS configurado antes de todo
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Permitir Postman o llamadas sin origin

      if (allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
        callback(null, true);
      } else {
        console.warn('❌ CORS bloqueado para origen:', origin);
        callback(new Error('No autorizado por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(requestLogger);

// 🚀 PERFORMANCE: Cache Headers
app.use((req, res, next) => {
  // API endpoints - cache corto para datos dinámicos
  if (req.path.startsWith(`${config.api.prefix}/${config.api.version}`)) {
    // Rutas públicas (listados, info básica) - 5 min cache
    if (req.method === 'GET' && (
      req.path.includes('/establecimientos') ||
      req.path.includes('/categorias') ||
      req.path.includes('/tipo-evento')
    )) {
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    }
    // Rutas privadas - no cache
    else if (req.path.includes('/auth') || req.path.includes('/perfil')) {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    }
    // Otras APIs - cache muy corto
    else if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    }
  }
  
  // Static files (uploads) - cache largo
  if (req.path.startsWith('/uploads')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 año
  }
  
  next();
});

// Static files
app.use('/uploads', express.static(path.resolve(process.cwd(), appConfig.upload.path)));

// API routes
app.use(`${config.api.prefix}/${config.api.version}`, apiRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'HandicApp API',
    version: config.api.version,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export { app };
