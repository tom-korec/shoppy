import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    globalSetup: ['./test/support/global-setup.ts'],
    setupFiles: ['./test/support/test-env.ts'],
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
  },
});
