import { expect, test } from '@playwright/test';
import { createList, signInNewUser } from './signed-in-user';

test('a starred list shows under favorites and another opened list under recently used', async ({
  page,
}) => {
  await signInNewUser(page);
  await createList(page, 'Groceries');
  const star = page.getByRole('button', { name: 'Favorite' });
  await star.click();
  await expect(star).toHaveAttribute('aria-pressed', 'true');
  await createList(page, 'Hardware');

  await page.getByRole('link', { name: 'Home', exact: true }).click();

  await expect(page.getByRole('list', { name: 'Favorites' }).getByRole('link')).toHaveText(
    /Groceries/,
  );
  await expect(page.getByRole('list', { name: 'Recently used' }).getByRole('link')).toHaveText(
    /Hardware/,
  );
});
