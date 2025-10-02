import pino from 'pino';
import { config } from '../config/config';

// Create logger instance
const logger = pino({
  level: config.logging.level,
  ...(config.nodeEnv === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
    censor: '[REDACTED]',
  },
});

// Request logger middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  req.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Only log non-static requests
  if (!req.url.includes('/favicon') && !req.url.includes('/public')) {
    logger.info({
      method: req.method,
      url: req.url,
      ip: req.ip,
    }, '→ Request');
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Only log significant requests or errors
    if (res.statusCode >= 400 || duration > 1000 || (!req.url.includes('/favicon') && !req.url.includes('/public'))) {
      logger.info({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
      }, res.statusCode >= 400 ? '✗ Request failed' : '✓ Request completed');
    }
  });
  
  next();
};

// Error logger
export const errorLogger = (error: Error, req?: any) => {
  logger.error({
    requestId: req?.requestId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    url: req?.url,
    method: req?.method,
    userId: req?.user?.id,
  }, 'Error occurred');
};

export { logger };
