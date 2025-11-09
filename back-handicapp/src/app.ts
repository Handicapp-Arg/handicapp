import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import { config } from './config/config';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './utils/errors';
import { requestLogger } from './utils/logger';
import path from 'path';
import { config as appConfig } from './config/config';

const app: Express = express();

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Parse cookies

// CORS configuration
import cors from 'cors';

const allowedOrigins = [
  'https://handicapp.com.ar',
  'https://www.handicapp.com.ar',
  'http://handicapp.com.ar',
  'http://www.handicapp.com.ar',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Permitir todos los orígenes en desarrollo
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    // En producción, verificar lista de orígenes permitidos
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Concise request logs (method, url, status, duration)
app.use(requestLogger);

// Static files for uploads (served at /uploads)
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

// Error handler (must be last)
app.use(errorHandler);

export { app };
