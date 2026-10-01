import { execFileSync } from 'node:child_process';
import pg from 'pg';
import { E2E_DATABASE_URL } from '../playwright.config';

export default async function globalSetup(): Promise<void> {
  const name = new URL(E2E_DATABASE_URL).pathname.slice(1);
  const admin = new URL(E2E_DATABASE_URL);
  admin.pathname = '/postgres';

  const client = new pg.Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
    if (rowCount === 0) await client.query(`CREATE DATABASE "${name}"`);
  } finally {
    await client.end();
  }

  execFileSync('pnpm', ['--filter', '@shoppy/api', 'exec', 'prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
    stdio: 'pipe',
  });
}
