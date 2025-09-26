import express from 'express';
import { config } from './config/config';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './utils/errors';

const app = express();

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS - Allow all origins for development
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

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
