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
  
  logger.info({
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
  }, 'Incoming request');
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    }, 'Request completed');
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
