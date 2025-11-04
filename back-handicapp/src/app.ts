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

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman) o desde localhost en desarrollo
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://handicapp.vercel.app',
      'https://handicapp-git-main-handicapps-projects.vercel.app'
    ];
    
    if (!origin || allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todos en desarrollo
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
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
