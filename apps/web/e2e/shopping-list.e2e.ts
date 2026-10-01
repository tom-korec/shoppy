import { expect, test } from '@playwright/test';
import { createList, quickAdd, signInNewUser } from './signed-in-user';

test.beforeEach(async ({ page }) => {
  await signInNewUser(page);
  await createList(page, 'Groceries');
});

test('add entries, check one off, undo, and restore from recent history', async ({ page }) => {
  await quickAdd(page, ['Milk, 2 l', 'Bread']);
  const entries = page.getByRole('region', { name: 'No category' });
  await expect(entries.getByText('Milk')).toBeVisible();
  await expect(entries.getByText('2 l')).toBeVisible();

  await page.getByRole('checkbox', { name: 'Bought Milk' }).click();
  await expect(entries.getByText('Milk')).toBeHidden();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(entries.getByText('Milk')).toBeVisible();

  await page.getByRole('checkbox', { name: 'Bought Bread' }).click();
  await expect(entries.getByText('Bread')).toBeHidden();
  await page.getByText(/Recent history/).click();
  await page.getByRole('button', { name: 'Put Bread back on the list' }).click();
  await expect(entries.getByText('Bread')).toBeVisible();

  await page.reload();
  await expect(entries.getByText('Milk')).toBeVisible();
  await expect(entries.getByText('Bread')).toBeVisible();
});

test('check selected entries in one go', async ({ page }) => {
  await quickAdd(page, ['Apples', 'Pears', 'Plums']);
  await expect(page.getByText('Plums')).toBeVisible();

  await page.getByRole('button', { name: 'List options' }).click();
  await page.getByRole('button', { name: 'Select entries' }).click();
  await page.getByRole('checkbox', { name: 'Select Apples' }).click();
  await page.getByRole('checkbox', { name: 'Select Plums' }).click();
  await page.getByRole('button', { name: 'Check', exact: true }).click();

  await expect(page.getByRole('status')).toHaveText('2 entries moved to history');
  await page.reload();
  await expect(page.getByText('Pears')).toBeVisible();
  await expect(page.getByText(/Recent history · 7 days \(2\)/i)).toBeVisible();
});

test('shopping mode: strike through, leave, come back and finish', async ({ page }) => {
  await quickAdd(page, ['Coffee', 'Tea']);
  await expect(page.getByText('Tea')).toBeVisible();

  const coffee = page.getByRole('checkbox', { name: 'Coffee', exact: true });
  await page.getByRole('link', { name: 'Shop' }).click();
  await expect(page.getByRole('button', { name: 'Finish · move 0 to history' })).toBeDisabled();
  await coffee.click();
  await expect(page.getByRole('button', { name: 'Finish · move 1 to history' })).toBeEnabled();

  await page.getByRole('link', { name: 'Back to the list' }).click();
  await page.getByRole('link', { name: 'Shop' }).click();
  await expect(coffee).toBeChecked();
  await page.getByRole('button', { name: 'Finish · move 1 to history' }).click();

  await expect(page.getByRole('heading', { name: 'Groceries' })).toBeVisible();
  await expect(page.getByText('Tea')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Bought Coffee' })).toBeHidden();
});
