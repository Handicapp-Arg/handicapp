import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { config } from './config/config';
import { config as appConfig } from './config/config';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './utils/errors';
import { requestLogger } from './utils/logger';

const app: Express = express();

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
