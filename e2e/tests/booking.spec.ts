import { test, expect } from '@playwright/test';

test.describe('Customer booking path', () => {
  test('slot grid renders 7 day columns', async ({ page }) => {
    await page.goto('/');

    const slotGrid = page.getByRole('region', { name: 'Available booking slots' });
    await expect(slotGrid).toBeVisible();

    const dayColumns = slotGrid.locator('[class*="rounded-lg"]');
    await expect(dayColumns).toHaveCount(7);
  });

  test('can book an available slot', async ({ page }) => {
    await page.goto('/');

    const slotButton = page.getByRole('button').filter({ hasText: '–' }).first();
    await expect(slotButton).toBeVisible({ timeout: 10000 });
    await slotButton.click();

    const modal = page.getByRole('dialog', { name: 'Book Appointment' });
    await expect(modal).toBeVisible();

    await page.getByLabel('Customer Name').fill('Test Customer');
    await page.getByLabel('Phone Number').fill('07900123456');
    await page.getByLabel('Vehicle Registration').fill('TE57TST');

    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    await expect(modal).not.toBeVisible({ timeout: 8000 });
  });
});
