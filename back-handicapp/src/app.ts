import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import { apiRoutes } from './routes';
import {
  corsOptions,
  rateLimiter,
  helmetConfig,
  compressionConfig,
  securityHeaders,
  requestId,
  trustProxy,
} from './middleware/security';
import { requestLogger } from './utils/logger';
import { errorHandler, notFoundHandler } from './utils/errors';

const app = express();

// Trust proxy (for rate limiting and IP detection)
app.use(trustProxy);

// Security middleware
app.use(helmetConfig);
app.use(securityHeaders);
app.use(compressionConfig);

// CORS
app.use(cors(corsOptions));

// Rate limiting
app.use(rateLimiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID and logging
app.use(requestId);
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
