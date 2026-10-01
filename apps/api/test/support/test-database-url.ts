// A separate database on the local docker Postgres (CI overrides it), so tests never touch dev data.
export const TEST_DATABASE_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgresql://shoppy:shoppy@localhost:5442/shoppy_test';
