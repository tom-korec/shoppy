import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/support/test-env.ts'],
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
  },
});
