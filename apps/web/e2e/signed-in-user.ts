import { expect, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { markEmailVerified } from './e2e-database';

const PASSWORD = 'Shopper123';

// A fresh, verified account. Registering through the page's request context stores the refresh
// cookie in the browser, so the app opens signed in.
export async function signInNewUser(page: Page): Promise<void> {
  const email = `e2e-${randomUUID()}@shoppy.test`;
  const res = await page.request.post('/api/auth/register', {
    data: { displayName: 'E2E Shopper', email, password: PASSWORD },
  });
  expect(res.status()).toBe(201);
  await markEmailVerified(email);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Shoppy' })).toBeVisible();
}

export async function createList(page: Page, name: string): Promise<void> {
  await page.getByRole('link', { name: 'Lists' }).click();
  await page.getByRole('button', { name: 'New list' }).click();
  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Create list' }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

export async function quickAdd(page: Page, texts: string[]): Promise<void> {
  const input = page.getByLabel('Add to list');
  for (const text of texts) {
    await input.fill(text);
    await input.press('Enter');
  }
}
