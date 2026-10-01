import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { markEmailVerified } from './e2e-database';

const PASSWORD = 'Shopper123';

test('register, confirm email, stay signed in across reloads, sign out and back in', async ({
  page,
}) => {
  const email = `e2e-${randomUUID()}@shoppy.test`;

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.getByLabel('Name').fill('E2E Shopper');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible();

  await markEmailVerified(email);
  await page.getByRole('button', { name: "I've confirmed it" }).click();
  await expect(page.getByRole('heading', { name: 'Shoppy' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Shoppy' })).toBeVisible();

  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Shoppy' })).toBeVisible();
});

test('rejects a wrong password', async ({ page }) => {
  await page.goto('/sign-in');

  await page.getByLabel('Email').fill(`nobody-${randomUUID()}@shoppy.test`);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('alert')).toHaveText('Wrong email or password');
});
