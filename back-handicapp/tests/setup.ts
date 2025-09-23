import { sequelize } from '@/config/database';

// Setup test database
beforeAll(async () => {
  // Connect to test database
  await sequelize.authenticate();
});

// Clean up after each test
afterEach(async () => {
  // Clear all tables
  await sequelize.truncate({ cascade: true });
});

// Clean up after all tests
afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DB_NAME = 'handicapp_test_db';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'password';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
