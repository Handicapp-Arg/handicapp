import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import { config } from './config/config';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './utils/errors';
import { requestLogger } from './utils/logger';

const app: Express = express();

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Parse cookies

// CORS configuration
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3003', 'http://127.0.0.1:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Importante: permite envío de cookies
  optionsSuccessStatus: 200
}));

// Concise request logs (method, url, status, duration)
app.use(requestLogger);

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
