import { test, expect } from '@playwright/test';

test.describe('Mechanic context switch', () => {
  test('switching to mechanic identity shows My Appointments nav link', async ({ page }) => {
    await page.goto('/');

    const identitySelect = page.getByLabel('Act As:');
    await expect(identitySelect).toBeVisible();

    await identitySelect.selectOption({ label: 'Mechanic — Dave' });

    const myAppointmentsLink = page.getByRole('link', { name: 'My Appointments' });
    await expect(myAppointmentsLink).toBeVisible();
  });

  test('mechanic appointments page renders after identity switch', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Act As:').selectOption({ label: 'Mechanic — Dave' });
    await page.getByRole('link', { name: 'My Appointments' }).click();

    await expect(page).toHaveURL('/my-appointments');

    const appointmentsSection = page.getByRole('region', { name: 'Mechanic appointments' });
    await expect(appointmentsSection).toBeVisible({ timeout: 8000 });
  });
});
