import { expect, type Page, test } from '@playwright/test';
import { quickAdd, signInNewUser } from './signed-in-user';

async function createHouseholdWithInviteLink(page: Page, role?: 'Viewer'): Promise<string> {
  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('button', { name: 'New household' }).click();
  await page.getByLabel('Name', { exact: true }).last().fill('Home');
  await page.getByRole('button', { name: 'Create household' }).click();
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();

  await page.getByRole('button', { name: 'Invite someone' }).click();
  if (role) await page.getByLabel('Role', { exact: true }).selectOption({ label: role });
  await page.getByRole('button', { name: 'Create invitation' }).click();
  const url = await page.getByText(/\/join\//).textContent();
  await page.getByRole('button', { name: 'Done' }).click();
  return new URL(url ?? '').pathname;
}

async function createHouseholdList(page: Page, name: string): Promise<void> {
  await page.getByRole('link', { name: 'Lists' }).click();
  await page.getByRole('button', { name: 'New list' }).click();
  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByLabel('For', { exact: true }).selectOption({ label: 'Home' });
  await page.getByRole('button', { name: 'Create list' }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

async function joinWith(page: Page, joinPath: string): Promise<void> {
  await page.goto(joinPath);
  await page.getByRole('button', { name: 'Join Home' }).click();
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
}

test('two people share a household list', async ({ page, browser, baseURL }) => {
  await signInNewUser(page);
  const joinPath = await createHouseholdWithInviteLink(page);
  await createHouseholdList(page, 'Shared');
  await quickAdd(page, ['Milk']);
  await expect(page.getByText('Milk')).toBeVisible();

  const memberContext = await browser.newContext({ baseURL });
  const member = await memberContext.newPage();
  await signInNewUser(member);
  await joinWith(member, joinPath);
  await member.getByRole('link', { name: 'Lists' }).click();
  await expect(member.getByRole('heading', { name: 'Home' })).toBeVisible();
  await member.getByRole('link', { name: /Shared/ }).click();
  await expect(member.getByText('Milk')).toBeVisible();
  await quickAdd(member, ['Bread']);
  await expect(member.getByText('Bread')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Bread')).toBeVisible();
  await memberContext.close();
});

test('a Viewer sees a shared list without the add box or checkboxes', async ({
  page,
  browser,
  baseURL,
}) => {
  await signInNewUser(page);
  const joinPath = await createHouseholdWithInviteLink(page, 'Viewer');
  await createHouseholdList(page, 'Shared');
  await quickAdd(page, ['Milk']);
  await expect(page.getByText('Milk')).toBeVisible();

  const viewerContext = await browser.newContext({ baseURL });
  const viewer = await viewerContext.newPage();
  await signInNewUser(viewer);
  await joinWith(viewer, joinPath);
  await viewer.getByRole('link', { name: 'Lists' }).click();
  await viewer.getByRole('link', { name: /Shared/ }).click();

  await expect(viewer.getByText('Milk')).toBeVisible();
  await expect(viewer.getByText('View only')).toBeVisible();
  await expect(viewer.getByLabel('Add to list')).toBeHidden();
  await expect(viewer.getByRole('checkbox', { name: 'Bought Milk' })).toBeHidden();
  await viewerContext.close();
});
