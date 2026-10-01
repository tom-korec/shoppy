// Runs before test files are imported: AppModule validates the environment at import time.
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  PROXY_SECRET: '',
});
