import { test, expect } from '@playwright/test';

test.describe('Phase 4: Candidate Experience & Public Portal Journey', () => {
  test('1. Homepage navigation, search, and category exploration', async ({ page }) => {
    await page.goto('/');

    // Check primary branding
    await expect(page).toHaveTitle(/Akshitha Edutech/i);
    await expect(page.locator('h1')).toContainText('Akshitha Edutech');

    // Check verified company card
    await expect(page.getByText('Verified Corporate Employer & Education Provider')).toBeVisible();

    // Check search form input
    const searchInput = page.getByPlaceholder(/job title, skill/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Engineering');
    await page.getByRole('button', { name: /^search jobs$/i }).click();

    // Verifies navigation to /jobs with query parameter
    await expect(page).toHaveURL(/\/jobs\?q=Engineering/);
  });

  test('2. Fresher entry point button navigates to filtered fresher vacancies', async ({ page }) => {
    await page.goto('/');

    // Click Browse Freshers Jobs
    const freshersButton = page.getByRole('button', { name: /browse freshers jobs/i });
    await expect(freshersButton).toBeVisible();
    await freshersButton.click();

    // Should navigate to /jobs?exp=fresher
    await expect(page).toHaveURL(/\/jobs\?exp=fresher/);
    await expect(page.getByText(/Filtering: Entry-Level \/ Freshers Only/i)).toBeVisible();
  });

  test('3. Jobs Browser filtering, keyword search, and filter reset', async ({ page }) => {
    await page.goto('/jobs');

    // Check job listings heading
    await expect(page.locator('h1')).toContainText('Private Sector Careers');

    // Experience filter tab
    const experiencedTab = page.getByRole('button', { name: /experienced roles/i });
    await experiencedTab.click();
    await expect(page).toHaveURL(/\/jobs\?exp=experienced/);

    // Reset filters
    const resetButton = page.getByRole('button', { name: /reset filters/i });
    await resetButton.click();
    await expect(page).toHaveURL(/\/jobs/);
  });

  test('4. Job detail page displays full requirements, salary, and deadline', async ({ page }) => {
    await page.goto('/jobs/graduate-trainee-software-engineer');

    // Title and company
    await expect(page.locator('h1')).toContainText('Graduate Trainee - Software Engineer');
    await expect(page.locator('main').getByText('Akshitha Edutech Private Limited', { exact: true })).toBeVisible();

    // Compensation (INR)
    await expect(page.getByText(/Compensation:/i)).toBeVisible();

    // Responsibilities and Qualifications sections
    await expect(page.getByRole('heading', { name: /key responsibilities/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /qualifications & eligibility/i })).toBeVisible();

    // Action buttons
    const applyButton = page.getByRole('button', { name: /apply for this position/i });
    await expect(applyButton).toBeVisible();

    const shareButton = page.getByRole('button', { name: /share job/i });
    await expect(shareButton).toBeVisible();

    const reportButton = page.getByRole('button', { name: /flag or report listing/i });
    await expect(reportButton).toBeVisible();
  });

  test('5. Non-existent, closed, or draft job slugs handle gracefully without crashing', async ({ page }) => {
    // Non-existent slug
    await page.goto('/jobs/non-existent-vacant-role-xyz');
    await expect(page.getByText(/position no longer available/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /browse active jobs/i })).toBeVisible();

    // Draft role must NEVER be revealed
    await page.goto('/jobs/lead-ui-ux-designer-draft');
    await expect(page.getByText(/position no longer available/i)).toBeVisible();
  });

  test('6. Contact & Career Enquiry Form completes submission safely', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('h1')).toContainText('Contact & Career Enquiries');

    // Fill enquiry fields
    await page.getByPlaceholder('e.g. Arun Kumar').fill('Test Candidate');
    await page.getByPlaceholder('arun@example.com').fill('candidate@example.com');
    await page.getByPlaceholder(/describe your question/i).fill('I am enquiring about fresher opportunities in software engineering.');

    // Submit
    await page.getByRole('button', { name: /send career enquiry/i }).click();

    // Confirmation
    await expect(page.getByText(/enquiry submitted successfully/i)).toBeVisible({ timeout: 10000 });
  });

  test('7. Career Guidance resources index and guide detail pages load', async ({ page }) => {
    await page.goto('/resources');

    await expect(page.locator('h1')).toContainText('Career Guidance & Placement Prep');
    await expect(page.getByText(/How to Craft a Standout Technical Resume/i)).toBeVisible();

    // Open guide
    await page.goto('/resources/fresher-resume-guide-2026');
    await expect(page.locator('article h1')).toContainText('How to Craft a Standout Technical Resume');
  });
});
