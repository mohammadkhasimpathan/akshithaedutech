import { test, expect } from '@playwright/test';

test.describe('Portal Foundation Smoke E2E', () => {
  test('homepage should load and display company branding', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Akshitha Edutech/i);

    // Check primary heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Akshitha Edutech');

    // Check action buttons
    const browseButton = page.getByRole('button', { name: /browse freshers jobs/i });
    await expect(browseButton).toBeVisible();
  });
});
