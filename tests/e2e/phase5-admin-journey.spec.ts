import { test, expect } from '@playwright/test';

test.describe('Phase 5: Secure Admin Portal End-to-End Journey', () => {
  test('unauthenticated visitors attempting to access /admin are redirected to /admin/login', async ({
    page,
  }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator('h1')).toContainText('Secure Admin Portal');
  });

  test('admin login form blocks invalid credentials with a descriptive alert', async ({
    page,
  }) => {
    await page.goto('/admin/login');

    await page.fill('#admin-email', 'intruder@example.com');
    await page.fill('#admin-password', 'WrongPassword123');
    await page.click('button[type="submit"]');

    const alert = page.locator('#login-error-alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Invalid administrative email or password');
  });

  test('blocks deactivated administrator accounts', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('#admin-email', 'inactive@akshithaedutech.com');
    await page.fill('#admin-password', 'AdminPass123!');
    await page.click('button[type="submit"]');

    const alert = page.locator('#login-error-alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('deactivated');
  });

  test('active admin logs in, navigates dashboard, manages jobs and reviews applications', async ({
    page,
  }) => {
    // 1. Log in as Lead Admin
    await page.goto('/admin/login');
    await page.fill('#admin-email', 'admin@akshithaedutech.com');
    await page.fill('#admin-password', 'AdminPass123!');
    await page.click('button[type="submit"]');

    // 2. Verified dashboard navigation
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Operations Dashboard' })
    ).toBeVisible();

    // Verify metrics cards exist
    await expect(page.locator('text=Applications').first()).toBeVisible();
    await expect(page.locator('text=Job Postings').first()).toBeVisible();
    await expect(page.locator('text=Recent System Activity')).toBeVisible();

    // 3. Navigate to Job Postings Management
    await page.click('a[href="/admin/jobs"]');
    await expect(page).toHaveURL(/\/admin\/jobs/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Job Postings Management' })
    ).toBeVisible();

    // Verify jobs table is rendered
    await expect(page.locator('table').first()).toBeVisible();
    await expect(page.locator('text=Graduate Trainee').first()).toBeVisible();

    // 4. Navigate to Post New Job
    await page.click('a[href="/admin/jobs/new"]');
    await expect(page).toHaveURL(/\/admin\/jobs\/new/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Create New Job Posting' })
    ).toBeVisible();

    // Fill minimum details and check preview
    await page.fill('#job-title', 'QA Automation Engineer');
    await page.click('text=Generate from title');
    await expect(page.locator('#job-slug')).toHaveValue('qa-automation-engineer');

    await page.click('button:has-text("Candidate Preview")');
    await expect(page.locator('text=Live Candidate Preview')).toBeVisible();
    await page.click('button:has-text("Close Preview")');

    // 5. Navigate to Candidate Applications
    await page.click('a[href="/admin/applications"]');
    await expect(page).toHaveURL(/\/admin\/applications/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Candidate Applications' })
    ).toBeVisible();
    await expect(page.locator('table').first()).toBeVisible();

    // Open candidate review drawer
    const reviewButton = page.locator('button:has-text("Review Application")').first();
    await reviewButton.click();
    await expect(page.locator('text=Applicant Dossier')).toBeVisible();
    await expect(page.locator('button:has-text("Download Resume")')).toBeVisible();
    await expect(page.locator('#admin-internal-notes')).toBeVisible();
    await page.click('button:has-text("Close")');

    // 6. Navigate to Candidate Enquiries
    await page.click('a[href="/admin/enquiries"]');
    await expect(page).toHaveURL(/\/admin\/enquiries/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Candidate & Partner Enquiries' })
    ).toBeVisible();

    // 7. Navigate to Job Issue Reports
    await page.click('a[href="/admin/reports"]');
    await expect(page).toHaveURL(/\/admin\/reports/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Job Posting Issue Reports' })
    ).toBeVisible();

    // 8. Sign out cleanly
    await page.click('button:has-text("Sign Out")');
    await expect(page).toHaveURL(/\/admin\/login/);

    // Verify session revoked
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
