import dotenv from 'dotenv';
import { z } from 'zod';


dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  HOST: z.string().default('localhost'),
  
  // Database - Support both DATABASE_URL and individual vars
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().transform(Number).optional(),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_DIALECT: z.string().default('postgres'),
  DB_LOGGING: z.string().transform(val => val === 'true').default(false),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default(0),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default(12),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default(true),
  
  // Frontend URL (for WebSocket CORS)
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  
  // Web App base URL (for links in emails)
  APP_WEB_URL: z.string().url().default('http://localhost:3000'),
  
  // SMTP / Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),
  SMTP_FROM_NAME: z.string().optional(),
  // Cloudinary (para almacenamiento de imágenes)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // API
  API_VERSION: z.string().default('v1'),
  API_PREFIX: z.string().default('/api'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default(10485760),
  UPLOAD_PATH: z.string().default('uploads/'),
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Parse DATABASE_URL if provided
let dbConfig;

if (env.DATABASE_URL) {
  // Parse postgres://user:password@host:port/database
  const url = new URL(env.DATABASE_URL);
  dbConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    name: url.pathname.slice(1), // Remove leading /
    user: url.username,
    password: url.password,
    dialect: env.DB_DIALECT,
    logging: env.DB_LOGGING,
  };
} else {
  dbConfig = {
    host: env.DB_HOST || 'localhost',
    port: env.DB_PORT || 5432,
    name: env.DB_NAME || 'handicapp',
    user: env.DB_USER || 'postgres',
    password: env.DB_PASSWORD || '',
    dialect: env.DB_DIALECT,
    logging: env.DB_LOGGING,
  };
}

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  frontend_url: env.FRONTEND_URL,
  jwt_secret: env.JWT_SECRET,
  
  database: dbConfig,
  
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET || env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  },
  
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: env.CORS_CREDENTIALS,
  },
  
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },
  
  app: {
    webUrl: env.APP_WEB_URL,
  },
  
  api: {
    version: env.API_VERSION,
    prefix: env.API_PREFIX,
  },
  
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    path: env.UPLOAD_PATH,
  },
  
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    from: {
      email: env.SMTP_FROM_EMAIL,
      name: env.SMTP_FROM_NAME || 'HandicApp',
    },
  },
  
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
} as const;
