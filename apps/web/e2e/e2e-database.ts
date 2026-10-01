import pg from 'pg';
import { E2E_DATABASE_URL } from '../playwright.config';

// Stands in for clicking the emailed link; the email itself only reaches the API log in E2E.
export async function markEmailVerified(email: string): Promise<void> {
  const client = new pg.Client({ connectionString: E2E_DATABASE_URL });
  await client.connect();
  try {
    await client.query('UPDATE users SET email_verified_at = now() WHERE email = $1', [email]);
  } finally {
    await client.end();
  }
}
