/**
 * Setup file para tests del backend
 * Se ejecuta antes de todos los tests
 */

import { vi } from 'vitest';

// Mock de variables de entorno para testing
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3001';
process.env['JWT_SECRET'] = 'test-secret-key-for-testing-with-minimum-32-chars-required';
process.env['VAPID_PUBLIC_KEY'] = 'test-vapid-public-key';
process.env['VAPID_PRIVATE_KEY'] = 'test-vapid-private-key';
process.env['VAPID_SUBJECT'] = 'mailto:test@handicapp.com';

// Mock de logger para tests (evitar logs en consola)
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  requestLogger: vi.fn((_req, _res, next) => next()),
  errorLogger: vi.fn(),
}));

// Aumentar timeout global para tests
vi.setConfig({ testTimeout: 10000 });
