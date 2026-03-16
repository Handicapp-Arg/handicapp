import Redis from 'ioredis';
import { config } from './config';
import { logger } from '../utils/logger';

// TTL del refresh token (7 días en segundos)
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

// Interfaz mínima de token store para poder intercambiar implementaciones
interface TokenStore {
  set(userId: number, token: string): Promise<void>;
  get(userId: number): Promise<string | null>;
  del(userId: number): Promise<void>;
}

// Fallback en memoria para desarrollo sin Redis
class MemoryTokenStore implements TokenStore {
  private store = new Map<number, string>();

  async set(userId: number, token: string) {
    this.store.set(userId, token);
  }
  async get(userId: number) {
    return this.store.get(userId) ?? null;
  }
  async del(userId: number) {
    this.store.delete(userId);
  }
}

// Store basado en Redis
class RedisTokenStore implements TokenStore {
  constructor(private client: Redis) {}

  private key(userId: number) {
    return `refresh_token:${userId}`;
  }

  async set(userId: number, token: string) {
    await this.client.set(this.key(userId), token, 'EX', REFRESH_TOKEN_TTL);
  }
  async get(userId: number) {
    return this.client.get(this.key(userId));
  }
  async del(userId: number) {
    await this.client.del(this.key(userId));
  }
}

function createTokenStore(): TokenStore {
  if (config.nodeEnv === 'development' && !process.env['REDIS_HOST']) {
    logger.warn('Redis no configurado — usando store en memoria (solo para desarrollo)');
    return new MemoryTokenStore();
  }

  const client = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    ...(config.redis.password && { password: config.redis.password }),
    db: config.redis.db,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 5) {
        logger.error('Redis: demasiados reintentos, desistiendo');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  client.on('connect', () => logger.debug('Redis connected'));
  client.on('error', (err) => logger.error('Redis error:', err));

  client.connect().catch((err) => {
    logger.error('Redis: fallo al conectar, usando store en memoria como fallback', err);
  });

  // Si Redis falla al conectar, degradamos gracefully a memoria
  let store: TokenStore = new RedisTokenStore(client);

  client.on('error', () => {
    if (!(store instanceof MemoryTokenStore)) {
      logger.warn('Redis no disponible — degradando a store en memoria');
      store = new MemoryTokenStore();
    }
  });

  // Proxy que siempre delega a la implementación activa
  return {
    set: (userId, token) => store.set(userId, token),
    get: (userId) => store.get(userId),
    del: (userId) => store.del(userId),
  };
}

export const tokenStore = createTokenStore();

// ─── Login rate limiter store ───────────────────────────────────────────────

interface LoginAttempt {
  count: number;
  resetAt: number;
}

interface LoginAttemptStore {
  get(email: string): Promise<LoginAttempt | null>;
  set(email: string, data: LoginAttempt, ttlMs: number): Promise<void>;
  del(email: string): Promise<void>;
}

class MemoryLoginAttemptStore implements LoginAttemptStore {
  private store = new Map<string, LoginAttempt>();

  async get(email: string) {
    return this.store.get(email) ?? null;
  }
  async set(email: string, data: LoginAttempt) {
    this.store.set(email, data);
  }
  async del(email: string) {
    this.store.delete(email);
  }
}

class RedisLoginAttemptStore implements LoginAttemptStore {
  constructor(private client: Redis) {}

  private key(email: string) {
    return `login_attempts:${email}`;
  }

  async get(email: string): Promise<LoginAttempt | null> {
    const raw = await this.client.get(this.key(email));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginAttempt;
    } catch {
      return null;
    }
  }

  async set(email: string, data: LoginAttempt, ttlMs: number) {
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    await this.client.set(this.key(email), JSON.stringify(data), 'EX', ttlSeconds);
  }

  async del(email: string) {
    await this.client.del(this.key(email));
  }
}

function createLoginAttemptStore(): LoginAttemptStore {
  if (config.nodeEnv === 'development' && !process.env['REDIS_HOST']) {
    return new MemoryLoginAttemptStore();
  }

  const client = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    ...(config.redis.password && { password: config.redis.password }),
    db: config.redis.db,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
  });

  client.on('error', () => {});
  client.connect().catch(() => {});

  let store: LoginAttemptStore = new RedisLoginAttemptStore(client);
  client.on('error', () => {
    if (!(store instanceof MemoryLoginAttemptStore)) {
      store = new MemoryLoginAttemptStore();
    }
  });

  return {
    get: (email) => store.get(email),
    set: (email, data, ttlMs) => store.set(email, data, ttlMs),
    del: (email) => store.del(email),
  };
}

export const loginAttemptStore = createLoginAttemptStore();
