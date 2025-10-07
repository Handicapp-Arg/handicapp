import pino from 'pino';
import { config } from '../config/config';

// Create logger instance
const baseLogger = pino({
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

// Logger flexible que acepta (msg), (msg, meta) o (meta, msg)
type Any = any; // uso intencional para compatibilidad amplia

function log(method: 'info'|'warn'|'error'|'debug', ...args: Any[]) {
  if (args.length === 2) {
    const [a, b] = args;
    if (typeof a === 'string') {
      // (msg, meta)
      return (baseLogger as Any)[method](b, a);
    }
    if (typeof b === 'string') {
      // (meta, msg)
      return (baseLogger as Any)[method](a, b);
    }
    return (baseLogger as Any)[method](a);
  }
  if (args.length === 1) {
    const [a] = args;
    if (typeof a === 'string') return (baseLogger as Any)[method](a);
    return (baseLogger as Any)[method](a);
  }
  return (baseLogger as Any)[method]();
}

const logger = {
  info: (...args: Any[]) => log('info', ...args),
  warn: (...args: Any[]) => log('warn', ...args),
  error: (...args: Any[]) => log('error', ...args),
  debug: (...args: Any[]) => log('debug', ...args),
};

// Request logger middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  req.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Only log non-static requests
  if (!req.url.includes('/favicon') && !req.url.includes('/public')) {
    logger.info('→ Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
    });
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Only log significant requests or errors
    if (res.statusCode >= 400 || duration > 1000 || (!req.url.includes('/favicon') && !req.url.includes('/public'))) {
      logger.info(res.statusCode >= 400 ? '✗ Request failed' : '✓ Request completed', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
      });
    }
  });
  
  next();
};

// Error logger
export const errorLogger = (error: Error, req?: any) => {
  logger.error('Error occurred', {
    requestId: req?.requestId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    url: req?.url,
    method: req?.method,
    userId: req?.user?.id,
  });
};

export { logger };
