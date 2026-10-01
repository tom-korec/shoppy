import { TEST_DATABASE_URL } from './test-database-url.js';

// Runs before test files are imported: AppModule validates the environment at import time.
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: TEST_DATABASE_URL,
  JWT_SECRET: 'test-jwt-secret-0123456789-0123456789',
  APP_URL: 'https://shoppy.test',
  PROXY_SECRET: '',
  RESEND_API_KEY: '',
  GOOGLE_CLIENT_ID: '',
});
