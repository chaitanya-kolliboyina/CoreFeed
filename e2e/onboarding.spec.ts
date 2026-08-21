import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow UI', () => {
  test('should display tags and allow selection', async ({ page }) => {
    // Navigate to the onboarding page
    await page.goto('/onboarding');

    // Check heading
    await expect(page.locator('h1')).toContainText('What are you interested in?');

    // Confirm that tags are rendered (from the mock data)
    const frontendTag = page.locator('button:has-text("Frontend")');
    await expect(frontendTag).toBeVisible();

    // The submit button should start disabled
    const submitButton = page.locator('button:has-text("Continue to Feed")');
    await expect(submitButton).toBeDisabled();

    // Click on Frontend and Backend tags
    await frontendTag.click();
    const backendTag = page.locator('button:has-text("Backend")');
    await backendTag.click();

    // Check that submit button is now enabled
    await expect(submitButton).toBeEnabled();
  });
});
