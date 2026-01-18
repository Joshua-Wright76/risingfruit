import { test, fastTest, expect } from './fixtures/test-fixtures';

test.describe('Filter Panel', () => {
  fastTest('should display filter toggle button', async ({ mapPage, page }) => {
    const filterToggle = page.locator('button').filter({ hasText: 'Filters' });
    await expect(filterToggle).toBeVisible();
  });

  test('should expand filter panel when clicking toggle', async ({ mapPage, page }) => {
    // Click to expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();

    // Check that season section is visible (web-first assertion auto-waits)
    const seasonLabel = page.locator('[data-testid="season-label"]');
    await expect(seasonLabel).toBeVisible();

    // Check for season filter button
    const seasonFilter = page.locator('[data-testid="season-filter"]');
    await expect(seasonFilter).toBeVisible();
  });

  test('should show season filter option', async ({ mapPage, page }) => {
    // Expand filters
    const filterToggle = page.locator('button').filter({ hasText: 'Filters' });
    await filterToggle.click();

    // Check for season filter section header (auto-waits)
    const seasonLabel = page.locator('[data-testid="season-label"]');
    await expect(seasonLabel).toBeVisible();

    const inSeasonButton = page.locator('[data-testid="season-filter"]');
    await expect(inSeasonButton).toBeVisible();
  });

  test('should toggle season filter when clicking', async ({ mapPage, page }) => {
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();

    // Wait for filter panel to expand
    const seasonFilter = page.locator('[data-testid="season-filter"]');
    await expect(seasonFilter).toBeVisible();

    // Click season filter
    await seasonFilter.click();

    // Button should have active state (auto-waits for attribute change)
    await expect(seasonFilter).toHaveAttribute('data-active', 'true');

    // Filter count badge should show
    const badge = page.locator('[data-testid="filter-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');
  });

  test('should show reset filters button when filters are active', async ({ mapPage, page }) => {
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();

    // Activate season filter
    const inSeasonButton = page.locator('[data-testid="season-filter"]');
    await expect(inSeasonButton).toBeVisible();
    await inSeasonButton.click();

    // Check for reset button (auto-waits)
    const resetButton = page.locator('text=Reset Filters');
    await expect(resetButton).toBeVisible();
  });

  test('should clear all filters when clicking reset button', async ({ mapPage, page }) => {
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();

    // Activate season filter
    const inSeasonButton = page.locator('[data-testid="season-filter"]');
    await expect(inSeasonButton).toBeVisible();
    await inSeasonButton.click();

    // Wait for filter to be active
    await expect(inSeasonButton).toHaveAttribute('data-active', 'true');

    // Click reset
    const resetButton = page.locator('text=Reset Filters');
    await resetButton.click();

    // Button should no longer have active state (auto-waits)
    await expect(inSeasonButton).toHaveAttribute('data-active', 'false');

    // Reset button should be hidden
    await expect(resetButton).not.toBeVisible();
  });

  test('should collapse filter panel when clicking toggle again', async ({ mapPage, page }) => {
    // Expand filters
    const filterToggle = page.locator('button').filter({ hasText: 'Filters' });
    await filterToggle.click();

    // Verify expanded
    const seasonLabel = page.locator('[data-testid="season-label"]');
    await expect(seasonLabel).toBeVisible();

    // Collapse filters
    await filterToggle.click();

    // Season section should be hidden (auto-waits)
    await expect(seasonLabel).not.toBeVisible();
  });

  test('should show filter count badge when season filter is active', async ({ mapPage, page }) => {
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();

    // Activate season filter
    const inSeasonButton = page.locator('[data-testid="season-filter"]');
    await expect(inSeasonButton).toBeVisible();
    await inSeasonButton.click();

    // Badge should show 1 (auto-waits)
    const badge = page.locator('[data-testid="filter-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');
  });
});
