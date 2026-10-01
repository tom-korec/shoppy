import { defineConfig, devices } from '@playwright/test';

// Separate ports and database, so E2E never collides with a running `pnpm dev`.
const API_PORT = 3100;
const WEB_PORT = 5190;
export const E2E_DATABASE_URL =
  process.env['E2E_DATABASE_URL'] ?? 'postgresql://shoppy:shoppy@localhost:5442/shoppy_e2e';

export default defineConfig({
  testDir: './e2e',
  testMatch: '*.e2e.ts',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }],
  webServer: [
    {
      command: 'pnpm --filter @shoppy/api exec nest start',
      url: `http://localhost:${API_PORT}/api/health`,
      timeout: 120_000,
      env: {
        NODE_ENV: 'development',
        PORT: String(API_PORT),
        LOG_LEVEL: 'warn',
        DATABASE_URL: E2E_DATABASE_URL,
        JWT_SECRET: 'e2e-jwt-secret-0123456789-0123456789',
        APP_URL: `http://localhost:${WEB_PORT}`,
        RESEND_API_KEY: '',
        GOOGLE_CLIENT_ID: '',
        PROXY_SECRET: '',
      },
    },
    {
      command: `pnpm exec vite --port ${WEB_PORT}`,
      url: `http://localhost:${WEB_PORT}`,
      timeout: 120_000,
      env: { API_PROXY_TARGET: `http://localhost:${API_PORT}` },
    },
  ],
});
